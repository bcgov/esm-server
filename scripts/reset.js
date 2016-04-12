/**
 * Created by wombat on 2016-04-08.
 */
'use strict';

var defaultConnectionString = "mongodb://localhost:27017/database-dev";

var http = require('https');
var fs = require('fs');
var path = require('path');
var request = require('request');

var resetForReprocessing = function resetForReprocessing(conn, limit) {
    console.log("Running conversion...");
    console.log("Batch size is ", limit);

    var MongoClient = require('mongodb').MongoClient;
    // Connect to the default db if not set
    if (undefined === conn) {
        conn = defaultConnectionString;
    }
    MongoClient.connect(conn, function (err, db) {
        if (err) {
            console.error(err);
            process.exit(-1);
        }

        var collection = db.collection('documents');

        var options = {
            "limit": parseInt(limit)
        };

        // Must start with migrated ...
        var query = {documentFileURL: new RegExp('^migrated')};

        collection.find(query, options).toArray(function (err, items) {

            if (items) {
                console.log("Item found: ", items.length);

                var item = items[0];

                if (item) {
                    items.forEach(function (item) {
                        item.documentFileURL = item.documentFileURL.replace("migrated:", "");

                        collection.update({_id: item._id}, {$set: item}, function () {
                            console.log(item._id + " was reset for re-importing");
                        });
                    })
                }
            }
        });
    })
};

// Needed for invalid certs
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

console.log("Documents will be reprocessed...");
resetForReprocessing(process.env.MONGO_CONNECTION);






