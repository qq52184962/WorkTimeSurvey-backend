var express = require('express');
var router = express.Router();
var request = require('request');
var cors = require('./cors');
var HttpError = require('./errors').HttpError;
var db = require('../libs/db');
var facebook = require('../libs/facebook');
var winston = require('winston');

router.use(cors);

function createError(message, status) {
    var err = new Error(message);
    err.status = status;

    return err;
}

/*
 *  When developing, you can set environment to skip facebook auth
 */
if (! process.env.SKIP_FACEBOOK_AUTH) {

router.post('/', function(req, res, next) {
    var access_token = req.body.access_token;

    facebook.access_token_auth(access_token).then(function(facebook) {
        winston.info("facebook auth success", {access_token: access_token});

        req.facebook = facebook;
        next();
    }).catch(function(err) {
        winston.info("facebook auth fail", {access_token: access_token});

        next(new HttpError("Unauthorized", 401));
    });
});

}

/*
 * POST /
 * company_id | company_name
 * job_title: string
 * week_work_time: integer
 * [salary_min]
 * [salary_max]
 * [salary_type]: suggest "hour", "month", "year"
 * [work_year]
 * [review]
 */
router.post('/', function(req, res, next) {
    /*
     * Prepare and collect the data from request
     */
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
        company: {},
        created_at: new Date(),
    };

    // pick these fields only
    // make sure the field is string
    [
        "job_title", "week_work_time",
        "salary_min", "salary_max", "salary_type",
        "work_year", "review",
    ].forEach(function(field, i) {
        if (req.body[field] && (typeof req.body[field] === "string") && req.body[field] !== "") {
            data[field] = req.body[field];
        }
    });
    if (req.body.company_id && (typeof req.body.company_id === "string") && req.body.company_id !== "") {
        data.company.id = req.body.company_id;
    }
    if (req.body.company_name && (typeof req.body.company_name === "string") && req.body.company_name !== "") {
        data.company.name = req.body.company_name;
    }

    /*
     * Check all the required fields, or raise an 422 http error
     */
    try {
        if (! data.job_title) {
            throw new HttpError("job_title is required", 422);
        }
        if (! data.week_work_time) {
            throw new HttpError("week_work_time is required", 422);
        }
        data.week_work_time = parseInt(data.week_work_time);
        if (isNaN(data.week_work_time)) {
            throw new HttpError("week_work_time need to be a number", 422);
        }

        if (! (data.company.id || data.company.name)) {
            throw new HttpError("company_id or company_name is required", 422);
        }
    } catch (err) {
        winston.info("workings insert data fail", data);

        next(err);
        return;
    }

    /*
     * So, here, the data are well-down
     */

    var collection = db.get().collection("workings");
    var companyCollection = db.get().collection("companies");

    // use company id to search company
    function searchCompanyById(id) {
        return companyCollection.find({
            id: id,
        }).toArray();
    }

    // use company name to search company
    function searchCompanyByName(name) {
        return companyCollection.find({
            name: name,
        }).toArray();
    }

    Promise.resolve(data).then(function(data) {
        console.log("autocompletion company");
        /*
         * 如果使用者有給定 company id，將 company name 補成查詢到的公司
         *
         * 如果使用者是給定 company name，如果只找到一間公司，才補上 id
         *
         * 其他情況看 issue #7
         */
        if (data.company.id) {
            return searchCompanyById(data.company.id).then(function(results) {
                if (results.length === 0) {
                    throw new HttpError("company_id is invalid", 429);
                }

                data.company.name = results[0].name;
                return data;
            });
        } else {
            return searchCompanyByName(data.company.name).then(function(results) {
                if (results.length === 1) {
                    data.company.id = results[0].id;
                    return data;
                } else {
                    return data;
                }
            });
        }
    }).then(function(data) {
        return collection.insert(data);
    }).then(function(result) {
        winston.info("workings insert data success", data);

        res.send(data);
    }).catch(function(err) {
        winston.info("workings insert data fail", data);

        next(err);
    });
});

module.exports = router;
