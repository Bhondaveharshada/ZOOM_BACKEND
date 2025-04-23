const { default: mongoose } = require('mongoose')


const meetingSChema = mongoose.Schema({
    topic:{
        required:true,
        type:String
    },
    meetingNumber:{
        type:Number
    },
    type:{
        type:Number,
        required:true
    },
    start_time:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    timezone:{
        type:String,
        required:true
    },
    agenda:{
        type:String,
        required:true
    },
    encrypted_password:{
        type:String,
    },
    join_url:{
        type:String,
    },
    created_at:{
        type:String
    },
    passcode:{
        type:String
    }
});

module.exports = mongoose.model('Meetings',meetingSChema)