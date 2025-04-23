require('dotenv').config();
const express = require('express');
const axios = require('axios');
const MeetingDb = require('../model/meetingSchema')
const {getAccessToken,getZakToken} = require('./tokens')



const CreateMeeting = async (req, res) => {
    
    const { topic, type, start_time, duration, timezone, agenda } = req.body;
  try {
    const accessToken = await getAccessToken()
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${process.env.ZOOM_USER_ID}/meetings`,
      {
        topic: topic,              
        type: type,                
        start_time: start_time,    
        duration: duration,        
        timezone: timezone,        
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
    
    const newMeeting = new MeetingDb({
      topic: response.data.topic,
      meetingNumber:response.data.id, 
      type:response.data.type,
      start_time:response.data.start_time,
      duration: response.data.duration,
      timezone: response.data.timezone,
      agenda: response.data.agenda,
      encrypted_password: response.data.encrypted_password,
      join_url:response.data.join_url,
      created_at:response.data.created_at,
      passcode:response.data.password

    });
    await newMeeting.save().then(()=>{
   
      res.json({
        message:"meeting created Succesfully",
        response : response.data,
        meetingNumber: response.data.id,
        joinUrl: response.data.join_url,
        password :response.data.password,
        zakToken : zakToken
      }); 
    });

     
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating meeting');
  }
};

const getMeetings = async (req, res) => {
    try {
      
      const meetings = await MeetingDb.find();
  
      const meetingDetails = meetings.map(meeting => {
        const url = new URL(meeting.join_url);
        const params = new URLSearchParams(url.search);
        const password = params.get('pwd');
  
        return {
          id: meeting.meetingNumber,               
          topic: meeting.topic,           
          start_time: meeting.start_time, 
          agenda: meeting.agenda,         
          password: meeting.passcode,  
          join_url: meeting.join_url      
        };
      });
  
      return res.json(meetingDetails);
      
    } catch (error) {
      console.error("Error fetching meetings:", error);
      return res.status(500).json({ error: 'Error fetching meetings' });
    }
};

const DeleteMeeting =  async (req, res) => {
    const meetingId  = req.params.meetingId;
    const accessToken  = await getAccessToken();
     
    if (!meetingId || !accessToken) {
      return res.status(400).json({ error: 'Meeting ID and Access Token are required' });
    }
  
    try {
      const response = await axios.delete(`${process.env.ZOOM_API_BASE_URL}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      return res.status(200).json({ message: 'Meeting deleted successfully', data: response.data });
    } catch (error) {
      console.error('Error deleting meeting:', error.response ? error.response.data : error.message);
  
      return res.status(500).json({
        error: 'Failed to delete meeting',
        details: error.response ? error.response.data : error.message,
      });
    }
}




module.exports = {
    CreateMeeting,
    getMeetings,
    DeleteMeeting
}
