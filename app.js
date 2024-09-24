const express = require("express");
const createmeeetRouter = require('./createMeet')
const signatureRouter = require('./signature')
const app = express();
const bodyParser = require("body-parser")
const cors = require('cors');

app.use(bodyParser.json({ limit: '100mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json())
app.use(cors())

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept, Authorization'
   );
   if(req.method ==='OPTIONS'){
    res.header('Access-Control-Allow-Methods','GET, POST, PATCH,PUT, DELETE');
    res.status(200).json({});
   }
   next()
  })

app.use('/',createmeeetRouter)
app.use('/',signatureRouter)

module.exports  = app



