var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var cors = require('./cors');
var HttpError = require('./errors').HttpError;

router.use(cors);

router.get('/', function(req, res, next) {
    var search = req.query.key || "";
    var page = req.query.page || 0;
    var q;

    if (search == "") {
        q = {};
    } else {
        q = {name: new RegExp("^" + search)};
    }

    MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) {
            next(new HttpError("Internal Server Error", 500));
            return;
        }
        var collection = db.collection('companies');

        collection.find(q).skip(25 * page).limit(25).toArray(function(err, docs) {
            if (err) {
                next(new HttpError("Internal Server Error", 500));
                return;
            }
            db.close();

            res.send(docs);
        });
    });
});

module.exports = router;
