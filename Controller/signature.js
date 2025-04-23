require('dotenv').config();
const express = require('express');
const {isBetween,isRequiredAllOrNone,inNumberArray,validateRequest,isValidationError} = require('../validations')
const jwt = require('jsonwebtoken')

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


const signature =(req, res) => {
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
  }


module.exports = {signature}
