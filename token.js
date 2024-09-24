require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router()
const qs = require('querystring');

let yourZoomJwtToken = null;
  let refreshToken = null;
  
  // Step 1: Redirect user to the Zoom authorization URL
  router.get('/authorize', (req, res) => {
    const redirectUri = 'http://localhost:4000/';
    const clientId = 'v_ILNsd6RIaXDo60R4yviQ'; // Your actual client_id

    const zoomAuthUrl = encodeURI(`https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`);
    
    res.redirect(zoomAuthUrl);
  });

  router.get('/', async (req, res) => {
    const code = req.query.code; // Get authorization code from Zoom
    try {
      const response = await axios.post('https://zoom.us/oauth/token', qs.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.REDIRECT_URL
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      // Store access token and refresh token
     
  
      // Send tokens to the client
      res.send(response.data.access_token);
      yourZoomJwtToken =  response.data.access_token
      console.log(yourZoomJwtToken);
      
    } catch (error) {
      console.error('Error fetching access token:', error);
      res.status(500).send('Error getting tokens');
    }
  });

  module.exports = router , yourZoomJwtToken