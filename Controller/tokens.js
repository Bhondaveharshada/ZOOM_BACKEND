require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router()
const qs = require('querystring');
const ZOOM_API_KEY = 'v_ILNsd6RIaXDo60R4yviQ';
const ZOOM_API_SECRET = 'UGpRsljbTZ4MztYHAlefPaVkHpWxVr95';
const ZOOM_USER_ID = 'SjU14zZjR326xAo69glG3Q';
const mongoose  =require('mongoose')
const Token = require('../model/Z_TokenSchema')


const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';



const getAccessToken =async ()=> {
    const tokenDoc = await Token.findOne();
    if (!tokenDoc) {
      throw new Error('No tokens found. You need to authorize the app.');
    }
  
    if (Date.now() > tokenDoc.tokenExpiryTime) {
      // Token expired, refresh it
      return await refreshZoomToken();
    } else {
      // Token is still valid
      return tokenDoc.accessToken;
    }
  }
  
  
const getZakToken = async () => {
    try{
       const accessToken = await getAccessToken()
      const response = await axios.get(`https://api.zoom.us/v2/users/${process.env.ZOOM_USER_ID}/token?type=zak`,{
        headers:{
          Authorization: `Bearer ${accessToken}`
        },
      });
      
    } catch (error){
      console.error('Error fetching ZAK Token', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  
const saveTokens= async(accessToken, refreshToken, tokenExpiryTime)=> {
    let tokenDoc = await Token.findOne(); // Assuming a single document for tokens
    if (tokenDoc) {
      // Update existing tokens
      tokenDoc.accessToken = accessToken;
      tokenDoc.refreshToken = refreshToken;
      tokenDoc.tokenExpiryTime = tokenExpiryTime;
    } else {
      // Create new token document
      tokenDoc = new Token({ accessToken, refreshToken, tokenExpiryTime });
    }
    await tokenDoc.save().then(()=>{
      console.log("saved tokens info successfully");
      
    });
  }
  
  const updateTokens = async(accessToken, refreshToken, tokenExpiryTime)=> {
    try {
      // Update existing token document with new tokens
      await Token.findOneAndUpdate(
        {}, // Find any existing document
        { accessToken, refreshToken, tokenExpiryTime }, // Set new token values
        { new: true, upsert: true } // Create if it doesn't exist (upsert)
      );
      console.log('Tokens updated successfully in the database');
    } catch (error) {
      console.error('Error updating tokens in the database:', error);
    }
  }
    
  async function refreshZoomToken() {
    console.log("called Refresh token successfully");
    
    try {
      const tokenDoc = await Token.findOne();
      if (!tokenDoc) throw new Error('No tokens found in the database');
  
      const response = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: tokenDoc.refreshToken
        },
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.Zoom_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      // Save new access and refresh tokens in DB
      const newAccessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;
      const newTokenExpiryTime = Date.now() + response.data.expires_in * 1000; // expires_in is in seconds
  
      await updateTokens(newAccessToken, newRefreshToken, newTokenExpiryTime);
  
  
      // Schedule the next token refresh before it expires
      scheduleTokenRefresh(response.data.expires_in);
  
      return newAccessToken; // Return the new access token
    } catch (error) {
      console.error('Error refreshing Zoom token:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  // Schedule token refresh before the token expires
  function scheduleTokenRefresh(expiresIn) {
    const refreshTime = (expiresIn - 60) * 1000; // Refresh 60 seconds before expiration
    console.log(`Scheduling token refresh in ${refreshTime / 1000} seconds`);
  
    setTimeout(refreshZoomToken, refreshTime);
  }
  
 router.get('/zoomtoken', (req,res)=>{
      const clientId = process.env.Zoom_API_key;
      const redirect_uri = encodeURIComponent(process.env.REDIRECT_URL)
      const responseType = 'code';
      const authorizationUrl = `https://zoom.us/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirect_uri}`
      res.redirect(authorizationUrl)
  });
  
  router.get('/callback',async(req,res)=>{
      const code = req.query.code;
      if(!code){
          return res.status(400).send('No code provided');
      }
      try{
          const response = await axios.post('https://zoom.us/oauth/token',null,{
              params:{
                  grant_type:'authorization_code',
                  code,
                  redirect_uri:process.env.REDIRECT_URL
              },
              headers:{
                  'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
                  'Content-Type':'application/x-www-form-urlencoded'
              }
          });
         const accessToken = response.data.access_token
         const refreshToken = response.data.refresh_token
         const  tokenExpiryTime = Date.now() + 3600 * 1000; //  1 hour expiry
  
          await saveTokens(accessToken, refreshToken,tokenExpiryTime)
          
          res.json(response.data);
          scheduleTokenRefresh(3600);
  
      }catch(error){
        console.log("Error",error);
        res.send('Error Obtaining Token ')
        
      }
  });

  module.exports = {
    getAccessToken,
    getZakToken,
    saveTokens,
    scheduleTokenRefresh,
    refreshZoomToken,
    updateTokens

  }
