var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({});
});

router.post('/', function(req, res, next) {
    var access_token = req.body.access_token;

    request.get({
        url: "https://graph.facebook.com/v2.6/me",
        qs: {
            access_token: access_token,
            fields: "id,name",
            format: "json",
        }
    }, function(error, response, body) {
        var content = JSON.parse(body);

        res.header("Access-Control-Allow-Origin", "*");
        res.send(content);
    });

});

module.exports = router;
