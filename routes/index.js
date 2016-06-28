var express = require('express');
var router = express.Router();
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) {
            next(createError("Internal Server Error", 500));

            return;
        }
        var collection = db.collection('workings');

        collection.find({}, {company_id: 1, company_name: 1, week_work_time: 1}).toArray(function(err, docs) {
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
                console.log("request error");
                next(createError("access_token is invalid", 401));

                return;
            }

            var content = JSON.parse(body);

            if (content.error) {
                console.log("request response with error field");
                next(createError("access_token is invalid", 401));

                return;
            }

            req.facebook = {id: content.id, name: content.name};

            next();
        });
    }
});

router.post('/', function(req, res, next) {
    var author = {};

    if (req.body.email && (typeof req.body.email === "string") && req.body.email !== "") {
        author.email = req.body.email;
    }

    if (req.facebook) {
        author.id = req.facebook.id,
        author.name = req.facebook.name,
        author.type = "facebook";
    } else {
        author.type = "test";
    }

    var data = {
        author: author,
    };

    // pick these fields only
    // make sure the field is string
    [
        "job_title", "week_work_time",
        "company_id", "company_name",
        "salary_min", "salary_max", "salary_type",
        "work_year", "review",
    ].forEach(function(field, i) {
        if (req.body[field] && (typeof req.body[field] === "string") && req.body[field] !== "") {
            data[field] = req.body[field];
        }
    });

    try {
        if (! data.job_title) {
            throw createError("job_title is required", 422);
        }
        if (! data.week_work_time) {
            throw createError("week_work_time is required", 422);
        }
        data.week_work_time = parseInt(data.week_work_time);
        if (isNaN(data.week_work_time)) {
            throw createError("week_work_time need to be a number", 422);
        }

        if (! (data.company_id || data.company_name)) {
            throw createError("company_id or company_name is required", 422);
        }
    } catch (err) {
        next(err);

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

module.exports = router;
