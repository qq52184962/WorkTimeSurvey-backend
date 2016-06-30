var MongoClient = require('mongodb').MongoClient;

var state = {
    db: null,
};

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    console.log("connect");

    if (! err) {
        state.db = db;
    }
});

module.exports.close = function() {
    state.db.close();

    state.db = null;
};

module.exports.get = function() {
    return state.db;
}

module.exports.pget = function() {
    return new Promise(function(resolve, reject) {
        if (state.db) {
            resolve(state.db);
        } else {
            reject(new Error("DB error"));
        }
    });
}
