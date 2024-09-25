require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router()
const qs = require('querystring');
const ZOOM_API_KEY = 'v_ILNsd6RIaXDo60R4yviQ';
const ZOOM_API_SECRET = 'UGpRsljbTZ4MztYHAlefPaVkHpWxVr95';
const ZOOM_USER_ID = 'SjU14zZjR326xAo69glG3Q';


const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';


//redirect to zoomauthorize
router.get('/authorize', (req, res) => {
  const redirectUri = 'http://localhost:4000/';
  const clientId = 'v_ILNsd6RIaXDo60R4yviQ'; // Your actual client_id

  const zoomAuthUrl = encodeURI(`https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`);
  
  res.redirect(zoomAuthUrl);
});

//get zoomtoken
let yourZoomJwtToken = '' ;
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
    res.send(response.data.access_token);
    yourZoomJwtToken =  response.data.access_token
    console.log("Zoom Token",yourZoomJwtToken);
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.status(500).send('Error getting tokens');
  }
});
   
getZakToken = async () => {
 try {
   const response = await axios.get(`https://api.zoom.us/v2/users/${ZOOM_USER_ID}/token?type=zak`, {
     headers: {
       Authorization: `Bearer ${yourZoomJwtToken}`,
     },
   });
   console.log("resp : ", response.data);
   
   return response.data.token; //Zak Token
 } catch (error) {
   console.error('Error fetching Zak Token:', error);
 }
};
    
//get meetings   
router.get('/get-meeting', async (req, res) => {
  try {
    console.log("Token from get meeting:", yourZoomJwtToken);

    const response = await axios.get(`https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`, {
      headers: {
        'Authorization': `Bearer ${yourZoomJwtToken}`
      }
    });
    const data = response.data;
    console.log("Meeting Data:", data);
    return res.json(data);

  } catch (error) {
    console.error("Error fetching meetings:", error);
    
    return res.status(500).json({ error: 'Error fetching meetings' });
  }
});

router.post('/create-meeting', async (req, res) => {
    
    const { topic, type, start_time, duration, timezone, agenda } = req.body;
  try {
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
          'Authorization': `Bearer ${yourZoomJwtToken}`,
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
  const accessToken  = yourZoomJwtToken;
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

