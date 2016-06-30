var express = require('express');
var router = express.Router();
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var cors = require('./cors');
var HttpError = require('./errors').HttpError;

router.use(cors);

router.get('/:job_title', function(req, res, next) {
    var job_title = req.params.job_title;

    console.log(job_title);

    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) {
            next(new HttpError("Internal Server Error", 500));
            return;
        }

        var collection = db.collection('workings');

        collection.aggregate([
            {
                $match: {
                    job_title: job_title,
                }
            },
            {
                $group: {
                    _id: "$company_id",
                    workings: {$push: {week_work_time: "$week_work_time", company_name: "$company_name"}},
                    average_week_work_time: {$avg: "$week_work_time"},
                    count: {$sum: 1},
                }
            },
        ], function(err, result) {
            if (err) {
                next(new HttpError("Internal Server Error", 500));
                return;
            }
            db.close();

            res.send(result);
        });
    });
});

module.exports = router;
