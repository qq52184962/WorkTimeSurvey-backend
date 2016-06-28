var express = require('express');
var router = express.Router();
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

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

function createError(message, status) {
    var err = new Error(message);
    err.status = status;

    return err;
}

router.post('/', function(req, res, next) {
    if (process.env.SKIP_FACEBOOK_AUTH) {
        console.log("skip facebook auth");

        next();
    } else {
        var access_token = req.body.access_token;

        if (! access_token) {
            next(createError("access_token is required", 429));

            return;
        } else if (access_token === "") {
            next(createError("access_token is required", 429));

            return;
        }

        console.log("facebook auth with access_token " + access_token);

        request.get({
            url: "https://graph.facebook.com/v2.6/me",
            qs: {
                access_token: access_token,
                fields: "id,name",
                format: "json",
            }
        }, function(error, response, body) {
            if (error) {
                next(createError("access_token is invalid", 401));

                return;
            }

            var content = JSON.parse(body);

            req.facebook = {id: content.id, name: content.name};

            next();
        });
    }
});

router.post('/', function(req, res, next) {
    var author = {
        email: req.body.email,
    };
    if (req.facebook) {
        author.id = req.facebook.id,
        author.name = req.facebook.name,
        author.type = "facebook";
    } else {
        author.type = "test";
    }

    var data = {
        author         : author,
        company_name   : req.body.company_name,
        company_id     : req.body.company_id,
        job_title      : req.body.job_title,
        week_work_time : req.body.week_work_time,
    };
    if ((! req.body.company_name) && (! req.body.company_id)) {
        next(createError("company is required", 429));

        return;
    }
    if (! req.body.job_title) {
        next(createError("job_title is required", 429));

        return;
    }
    if (! req.body.week_work_time) {
        next(createError("week_work_time is required", 429));

        return;
    }

    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) {
            console.log("Connect to DB fail");
            next(createError("Internal Server Error", 500));

            return;
        }

        var collection = db.collection('workings');

        collection.insert(data, function(err, result) {
            if (err) {
                console.log("DB insert fail");
                next(createError("Internal Server Error", 500));

                return;
            }
            db.close();

            res.header("Access-Control-Allow-Origin", "*");
            res.send(data);
        });
    });
});

router.post('/:working_id', function(req, res, next) {
    var fields = ["salary_min", "salary_max", "salary_type", "work_year", "review"];
    var data = {};

    fields.forEach(function(field, i) {
        if (req.body[field]) {
            data[field] = req.body[field];
        }
    });

    console.log(data);

    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        var collection = db.collection('workings');

        collection.updateOne({_id: ObjectId(req.params.working_id)}, {$set: data}, function(err, result) {
            db.close();

            res.header("Access-Control-Allow-Origin", "*");
            res.send(data);
        });
    });
});

router.get('/:working_id', function(req, res, next) {
    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        var collection = db.collection('workings');

        collection.find({_id: ObjectId(req.params.working_id)}, {author: 0}).toArray(function(err, docs) {
            db.close();

            res.header("Access-Control-Allow-Origin", "*");
            res.send(docs);
        });
    });
});

module.exports = router;
