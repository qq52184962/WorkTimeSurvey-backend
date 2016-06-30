var MongoClient = require('mongodb').MongoClient;

var _db = null;

module.exports.connect = function(url, callback) {
    MongoClient.connect(url, function(err, db) {
        if (! err) {
            _db = db;
        }
        callback();
    });

}

module.exports.close = function() {
    _db.close();

    _db = null;
};

module.exports.get = function() {
    return _db;
};
