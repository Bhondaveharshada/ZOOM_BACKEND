const mongoose = require("mongoose")

const zoomTokenSchema = mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    tokenExpiryTime: Number
});


const zoomToken =mongoose.model("Tokens", zoomTokenSchema)

module.exports = zoomToken
