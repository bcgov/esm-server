'use strict';

var defaultConnectionString = "mongodb://localhost:27017/database-dev";

var http 		= require('https');
var fs 			= require('fs');
var path 		= require('path');
var request 	= require ('request');

var documentConversion = function documentConversion(conn) {
	console.log("Running conversion...");
	var MongoClient = require('mongodb').MongoClient;
	// Connect to the default db if not set
	if (undefined === conn) {
		conn = defaultConnectionString;
	}
	MongoClient.connect(conn, function(err, db) {
		if(err) { return console.dir(err); }

		var collection = db.collection('documents');
		var val=0;
		collection.find().toArray(function(err, items) {
			var item = items[0];
			items.forEach(function(item) {
				// If the File URL is there, and it starts with http, it's needing
				// migration
				if (item.documentFileURL && item.documentFileURL.startsWith("http") === true) {
					var dataLength 	= 0;
					var fname 		= path.basename(item.documentFileURL);
					var uuid 		= require('node-uuid');
					var stream 		= uuid.v1() + path.extname(item.documentFileURL);
					var file 		= fs.createWriteStream(stream);
					console.log("Attempting to migrate: ",item._id);
					var request = http.get(item.documentFileURL, function(response) {
						response.on('data', function (chunk) {
							// Record the size & write to disk
							dataLength += chunk.length;
							file.write(chunk);
						}).on('end', function () {  // done
							file.end();
							console.log(item._id + " Download Complete, size written: " + dataLength);
							item.internalURL = __dirname + path.sep + stream;
							item.internalOriginalName = item.documentFileName;
							item.internalName = stream;
							// TODO
							// item.internalMime = "x-pdf";
							item.internalExt = path.extname(item.documentFileURL);
							item.internalSize = dataLength;
							// Chagange URL to migrated, but save the pointer just in case
							// The rest of the model won't use this.
							item.documentFileURL = "migrated:"+item.documentFileURL;
							// TODO
							// item.internalEncoding "7bit";
							collection.update({_id: item._id}, {$set: item }, function () {
								console.log(item._id + " Entry Updated");
							});
						});
					}).on('error', function (err) {
						console.log("****************");
						console.log("Server error:",err);
						console.log("Document id:" + item._id);
						fs.unlink(stream);
					});
				}
			});
		});
	});
}

// Needed for invalid certs
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Runs the conversion based on input if set, otherwise defaults to above constant
documentConversion(process.env.MONGO_CONNECTION);