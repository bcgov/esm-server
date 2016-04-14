'use strict';

var defaultConnectionString = "mongodb://localhost:27017/database-dev";

var http = require('https');
var fs = require('fs');
var path = require('path');
var request = require('request');

var NO_MORE_TO_PROCESS = 1;
var CONTINUE_TO_PROCESS = 0;

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


        // Must start with http ...
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
                    });
                }
            }
        });
    });
};

var documentConversion = function documentConversion(conn, downloads_dir, limit) {
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


        // Must start with http ...
        var query = {documentFileURL: new RegExp('^http')};

        collection.find(query, options).toArray(function (err, items) {
            // console.log("err",err);
            if (items) {

                if (!fs.existsSync(downloads_dir)) {
                    console.log("Downloads dir does not exist. Creating...", downloads_dir);
                    fs.mkdirSync(downloads_dir);
                }

                var total = items.length;
                if (total === 0) {
                    console.log("no items to process");
                    process.exit(NO_MORE_TO_PROCESS);
                }
                console.log("found items.. processing ", total);
                var item = items[0];
                var count = 0;
                var shouldExit = function () {
                    count++;
                    if (count == total) {
                        console.log("finished");
                        process.exit(total == limit ? CONTINUE_TO_PROCESS : NO_MORE_TO_PROCESS);
                    }
                };
                if (item) {
                    items.forEach(function (item) {
                        var downloadURL = item.documentFileURL;
                        var projectID = item.project._id;
                        var dataLength = 0;
                        var uuid = require('node-uuid');
                        var generatedFilename = uuid.v1() + path.extname(downloadURL);
                        var stream = downloads_dir + path.sep + projectID + path.sep + generatedFilename;
                        console.log("Writing to: ", stream);
                        var file = fs.createWriteStream(stream);
                        console.log("Attempting to migrate: ", item._id);
                        console.log("Retrieving: ", downloadURL);
                        var request = http.get(downloadURL, function (response) {
                            response.on('data', function (chunk) {
                                // Record the size & write to disk
                                dataLength += chunk.length;
                                file.write(chunk);
                            }).on('end', function () {  // done
                                file.end();
                                console.log(item._id + " Download Complete, size written: " + dataLength);
                                item.internalURL = path.sep + stream;
                                item.internalOriginalName = item.documentFileName;
                                item.internalName = generatedFilename;
                                // TODO
                                // item.internalMime = "x-pdf";
                                item.internalExt = path.extname(item.documentFileURL);
                                item.internalSize = dataLength;
                                // Chagange URL to migrated, but save the pointer just in case
                                // The rest of the model won't use this.
                                item.documentFileURL = "migrated:" + item.documentFileURL;

                                // TODO
                                // item.internalEncoding "7bit";
                                collection.update({_id: item._id}, {$set: item}, function () {
                                    console.log(item._id + " Entry Updated");
                                    shouldExit();
                                });
                            });
                        }).on('error', function (err) {
                            console.log("****************");
                            console.log("Server error:", err);
                            console.log("Document id:" + item._id);
                            fs.unlink(stream);
                        });
                    });
                }
            } else {
                console.log("No more items to process.");
                process.exit(total == limit ? CONTINUE_TO_PROCESS : NO_MORE_TO_PROCESS);
            }
        });
    });
};

// Needed for invalid certs
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var reprocess = process.env.REPROCESS || "false";

if (reprocess.toLowerCase() === "true") {
    console.log("Documents will be reprocessed...");
    resetForReprocessing(process.env.MONGO_CONNECTION, process.env.LIMIT);
}

documentConversion(process.env.MONGO_CONNECTION, process.env.DOWNLOADS_DIR || "uploads", process.env.LIMIT);




