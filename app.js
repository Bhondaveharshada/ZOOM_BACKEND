require('dotenv').config()
const express = require("express");
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const createmeeetRouter = require('./Meeting');
const app = express();
const bodyParser = require("body-parser")
const cors = require('cors');
const { inNumberArray, isBetween, isRequiredAllOrNone, validateRequest } = require('./validations')

app.use(bodyParser.json({ limit: '100mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json())
app.use(cors());

mongoose.connect('mongodb://localhost:27017/ZoomTokens').then(()=>{
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

  //signature 
   const propValidations = {
     role: inNumberArray([0, 1]),
     expirationSeconds: isBetween(1800, 172800)
   }
   const schemaValidations = [isRequiredAllOrNone(['meetingNumber', 'role'])]
   
   const coerceRequestBody = (body) => ({
     ...body,
     ...['role', 'expirationSeconds'].reduce(
       (acc, cur) => ({ ...acc, [cur]: typeof body[cur] === 'string' ? parseInt(body[cur]) : body[cur] }),
       {}
     )
   });
   
   app.post('/signature', (req, res) => {
     const requestBody = coerceRequestBody(req.body)
     const validationErrors = validateRequest(requestBody, propValidations, schemaValidations)
   
     if (validationErrors.length > 0) {
       return res.status(400).json({ errors: validationErrors })
     }
   
     const { meetingNumber, role, expirationSeconds } = requestBody
     const iat = Math.floor(Date.now() / 1000)
     const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2
     const oHeader = { alg: 'HS256', typ: 'JWT' }
   
     const oPayload = {
       appKey: process.env.ZOOM_API_KEY,
       sdkKey: process.env.ZOOM_API_KEY,
       mn: meetingNumber,
       role,
       iat,
       exp,
       tokenExp: exp
     }
  
     const sdkJWT = jwt.sign(oPayload, process.env.ZOOM_API_SECRET, { algorithm: 'HS256' })
     console.log("signature",sdkJWT)
   
     return res.json({ signature: sdkJWT })
   });
  
app.use('/',createmeeetRouter)



module.exports  = app 



