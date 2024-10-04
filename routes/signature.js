const express = require('express')
const router = express.Router();
const {signature} =require('../Controller/signature')
const {isBetween,isRequiredAllOrNone,inNumberArray,validateRequest,isValidationError} = require('../validations')

router.post('/signature',signature)

module.exports = router