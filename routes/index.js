var express = require('express');
var router = express.Router();
var request = require('request');
var MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {
    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) {
            res.send({
                status: "error"
            });
        }
        var collection = db.collection('workings');

        collection.find({}, {company: 1}).toArray(function(err, docs) {
            db.close();

            res.send(docs);
        });
    });
});

router.post('/', function(req, res, next) {
    var access_token = req.body.access_token;
    var email = req.body.email;
    var
        company_name = req.body.company_name,
        company_id = req.body.company_id,
        job_title = req.body.job_title,
        worktime = req.body.worktime,
        salary = req.body.salary,
        workyear = req.body.workyear;

    request.get({
        url: "https://graph.facebook.com/v2.6/me",
        qs: {
            access_token: access_token,
            fields: "id,name",
            format: "json",
        }
    }, function(error, response, body) {
        var content = JSON.parse(body);

        MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
            var collection = db.collection('workings');

            var data = {
                author: {
                    id: content.id,
                    name: content.name,
                    email: email,
                    type: 'facebook',
                },
                company_name: company_name,
                company_id: company_id,
                job_title: job_title,
                worktime: worktime,
                salary: salary,
                workyear: workyear,
            };

            collection.insert(data, function(err, result) {
                db.close();

                res.header("Access-Control-Allow-Origin", "*");
                res.send(data);
            });
        });
    });

});

module.exports = router;
