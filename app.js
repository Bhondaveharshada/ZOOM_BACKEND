require('dotenv').config()
const express = require("express");
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = express();
const bodyParser = require("body-parser")
const MeetingRouter = require('./routes/Meeting')
const signatureRouter = require('./routes/signature')
const cors = require('cors');


app.use(bodyParser.json({ limit: '100mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json())
app.use(cors());

mongoose.connect('mongodb+srv://manishabhondave640:qnckVxwztBcIvXVR@cluster0.i0oynzh.mongodb.net/ZoomTokens?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
  console.log("mongodb connected");
}).catch((error)=>{
  console.log("error in mongodb connection",error);
})
  

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept, Authorization'
   );
   if(req.method ==='OPTIONS'){
    res.header('Access-Control-Allow-Methods','GET, POST, PATCH,PUT, DELETE');
    res.status(200).json({});
   }
   next()
  });
  
app.use('/',MeetingRouter)
app.use('/',signatureRouter)


module.exports  = app 



