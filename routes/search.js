var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

/* GET home page. */
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
            res.send({
                status: "error"
            });
        }
        var collection = db.collection('companies');

        collection.find(q).skip(25 * page).limit(25).toArray(function(err, docs) {
            db.close();

            res.header("Access-Control-Allow-Origin", "*");
            res.send(docs);
        });
    });
});

module.exports = router;
