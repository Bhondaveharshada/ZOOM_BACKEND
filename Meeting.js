require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router()
const qs = require('querystring');
const ZOOM_API_KEY = 'v_ILNsd6RIaXDo60R4yviQ';
const ZOOM_API_SECRET = 'UGpRsljbTZ4MztYHAlefPaVkHpWxVr95';
const ZOOM_USER_ID = 'SjU14zZjR326xAo69glG3Q';
const mongoose  =require('mongoose')
const Token = require('./model/Z_TokenSchema')

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';


//redirect to zoomauthorize


//get zoomtoken
/* let accessToken = '';    // Store the access token
let refreshToken = '';   // Store the refresh token
let tokenExpiryTime = 0; */ // Store token expiry time (in ms)

async function saveTokens(accessToken, refreshToken, tokenExpiryTime) {
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

async function updateTokens(accessToken, refreshToken, tokenExpiryTime) {
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

async function getAccessToken() {
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


    
//get meetings   
router.get('/get-meeting', async (req, res) => {
  try {
    const accessToken = await getAccessToken()
    console.log("Token from get meeting:", accessToken);

    const response = await axios.get(`https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const meetings = response.data.meetings;

    const meetingDetails = meetings.map(meeting => {
      const url = new URL(meeting.join_url);
      const params = new URLSearchParams(url.search);
      const password = params.get('pwd');
       

      return {
        id: meeting.id, 
        topic: meeting.topic,  
        start_time: meeting.start_time, 
        agenda: meeting.agenda, 
        password: password ||meeting.password,  
        join_url: meeting.join_url 
      };
    });
    return res.json(meetingDetails);
    
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return res.status(500).json({ error: 'Error fetching meetings' });
  }
});
    
    


router.post('/create-meeting', async (req, res) => {
    
    const { topic, type, start_time, duration, timezone, agenda } = req.body;
  try {
    const accessToken = await getAccessToken()
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      {
        topic: topic,              // Meeting topic from user input
        type: type,                // 1 for instant meeting, 2 for scheduled
        start_time: start_time,    // Meeting start time (ISO format)
        duration: duration,        // Duration in minutes
        timezone: timezone,        // Timezone (UTC)
        agenda: agenda,           //meeting agenda
        settings:{
          host_video:true,
          participant_video:true,
          join_before_host:false,
          mute_upon_entry:true,
          watermark:false,
          use_pmi:false,
          approval_type:2,
          audio:'both',
          auto_recording: 'local'
        }            
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("response", response.data);
    const zakToken = await getZakToken();
    console.log("Zak : ", zakToken);
    
    res.json({
      response : response.data,
      meetingNumber: response.data.id,
      joinUrl: response.data.join_url,
      password :response.data.password,
      zakToken : zakToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating meeting');
  }
});
//delete meetings
router.delete('/delete-meeting/:meetingId', async (req, res) => {
  const meetingId  = req.params.meetingId;
  const accessToken  = await getAccessToken();
  console.log("accesstoken",accessToken);
   // Access token required for authorization

  if (!meetingId || !accessToken) {
    return res.status(400).json({ error: 'Meeting ID and Access Token are required' });
  }

  try {
    // DELETE request to Zoom API to delete the meeting
    const response = await axios.delete(`${ZOOM_API_BASE_URL}/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Send success response
    return res.status(200).json({ message: 'Meeting deleted successfully', data: response.data });
  } catch (error) {
    console.error('Error deleting meeting:', error.response ? error.response.data : error.message);

    // Send error response
    return res.status(500).json({
      error: 'Failed to delete meeting',
      details: error.response ? error.response.data : error.message,
    });
  }
});

    










module.exports = router  

