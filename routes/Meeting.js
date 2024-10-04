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
const MeetingDb = require('../model/meetingSchema')
const {CreateMeeting,getMeetings,DeleteMeeting} = require('../Controller/meetings')
const {scheduleTokenRefresh,saveTokens} = require('../Controller/tokens')










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
   
router.get('/get-meeting',getMeetings );
router.post('/create-meeting', CreateMeeting );
router.delete('/delete-meeting/:meetingId',DeleteMeeting);




module.exports = router  

