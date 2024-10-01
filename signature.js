/* const express = require('express');

const jwt = require('jsonwebtoken');
const router = express.Router()
const ZOOM_API_KEY = 'v_ILNsd6RIaXDo60R4yviQ';
const ZOOM_API_SECRET = 'UGpRsljbTZ4MztYHAlefPaVkHpWxVr95';


router.post('/api/signature', (req, res) => {
    try{
       const { meetingNumber, role } = req.body;
  
    // Generate signature directly inside the POST request
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2; // Token valid for 2 hours
  
    const payload = {
      sdkKey: ZOOM_API_KEY,
      mn: meetingNumber,
      role: role,
      iat: iat,
      exp: exp,
      appKey: ZOOM_API_KEY,
      tokenExp: exp
    };
  
    const signature = jwt.sign(payload, ZOOM_API_SECRET, { algorithm: 'HS256' });
  
   res.json({
    signature:signature
   })

    }catch(error){
        res.status(500).json({
             error: 'An error occurred while generating the signature'
        })
    }
    
  });
  

module.exports = router */