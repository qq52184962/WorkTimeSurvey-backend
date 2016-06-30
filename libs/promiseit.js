var MongoClient = require('mongodb').MongoClient;

function mongoConnect() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
            if (err) {
                reject(err);
                return;
            }
            resolve(db);
        });
    });
}

function collectionAggregate(collection, ...args) {
    return new Promise(function(resolve, reject) {
        collection.aggregate(...args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

function collectionInsert(collection, ...args) {
    return new Promise(function(resolve, reject) {
        collection.insert(...args, function(err, result) {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

module.exports = {
    mongoConnect: mongoConnect, 
    collectionAggregate: collectionAggregate,
    collectionInsert: collectionInsert
};
