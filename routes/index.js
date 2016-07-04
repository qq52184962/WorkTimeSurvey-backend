var express = require('express');
var router = express.Router();
var request = require('request');
var cors = require('./cors');
var HttpError = require('./errors').HttpError;
var facebook = require('../libs/facebook');
var winston = require('winston');

router.use(cors);

function createError(message, status) {
    var err = new Error(message);
    err.status = status;

    return err;
}

module.exports = router;
