const express = require('express');
const axios = require('axios');
const router = express.Router()
const app = express();

const ZOOM_API_KEY = 'v_ILNsd6RIaXDo60R4yviQ';
const ZOOM_API_SECRET = 'UGpRsljbTZ4MztYHAlefPaVkHpWxVr95';
const ZOOM_USER_ID = 'SjU14zZjR326xAo69glG3Q';
//const yourZoomJwtToken = 'eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjI3M2Q1MWMwLTJjNDctNDhmNi1hNTkzLThmYmIyOTA5MjhkOSJ9.eyJ2ZXIiOjEwLCJhdWlkIjoiOTk1OTM1Y2I3NzNjODA5YzFkMjYwNmY3ZWU5MGU4OGM1YTJhNDlmZjZiYTJkMGU4ZjI3YjQ5YTA2YzMyYzhlNiIsImNvZGUiOiJtMG1KdFJwZWc5MWtmNllSSmZOUW1XVm1RdmRtTXVmR3ciLCJpc3MiOiJ6bTpjaWQ6dl9JTE5zZDZSSWFYRG82MFI0eXZpUSIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJTalUxNHpaalIzMjZ4QW82OWdsRzNRIiwibmJmIjoxNzI2OTE1NTY1LCJleHAiOjE3MjY5MTkxNjUsImlhdCI6MTcyNjkxNTU2NSwiYWlkIjoiZmhTbVpOeW5SUjZScl9kT25qNjhldyJ9.FixsJ7wjQ7YHm-DIB3vJyS5-nFeylp7gX4yajWQZfuRAjkW2zlQgWEJUn7LCRZsh8fjxHYYT3D0y2j20GIX30w'
const {yourZoomJwtToken} = require('./token')



 getZakToken = async () => {
  try {
    const response = await axios.get(`https://api.zoom.us/v2/users/${ZOOM_USER_ID}/token?type=zak`, {
      headers: {
        Authorization: `Bearer ${yourZoomJwtToken}`,
      },
    });
    console.log("resp : ", response.data);
    
    return response.data.token; // This is the Zak Token
  } catch (error) {
    console.error('Error fetching Zak Token:', error);
  }
};


router.get('/get-meeting', async (req,res)=>{
  try{
    const response =  await axios.get('https://api.zoom.us/v2/users/me/meetings',{
     headers:{
         'Authorization': `Bearer ${yourZoomJwtToken}`
     }
    });
    const data =  response.data
    
   // console.log(data);
    
    return data
 }catch(error){
     console.error("Error",error);
     
 }
})



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
        agenda: agenda,
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
        }            //meeting agenda
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

module.exports = router  

