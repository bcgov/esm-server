'use strict';

var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var defaultConnectionString = "mongodb://localhost:27017/esm";
var username = "";
var password = "";
var host = "";
var db = "";
var moment = require('moment');

// Is this needed for invalid certs?
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

console.log("Starting ETL.");
function allDone() {
	console.log("Done ETL");
}

/*
 snipped code from another script. This may be useful for enviros with password
 */
var args = process.argv.slice(2);
if (args.length !== 4) {
	console.log("Using default localhost connection:", defaultConnectionString);
} else {
	username = args[0];
	password = args[1];
	host = args[2];
	db = args[3];
	defaultConnectionString = "mongodb://" + username + ":" + password + "@" + host + ":27017/" + db;
}

process.on('unhandledRejection', function (error, promise) {
	console.error("UNHANDLED REJECTION", error, error.stack);
});
process.on('uncaughtException', function (error) {
	console.error("UNCAUGHT EXCEPTION", error, error.stack);
});

function runUpdate() {
	return new Promise(function (resolve, reject) {
		MongoClient.connect(defaultConnectionString, function (err, db) {
			if (err) {
				return reject(err);
			}
			var collection = db.collection('projects');
			collection.find({},{_id:1}).toArray()
			.then(function (allProjects) {
				//console.log(allProjects);
				var manyDocs = [];
				_.forEach(allProjects, function (pId) {
					var doc = {
						"context" : pId._id.toString(),
						"user" : null,
						"owner" : "project-system-admin",
						"role" : "assessment-ceaa"
					};
					manyDocs.push(doc);
				});

				var _roles = db.collection('_roles');
				_roles.insertMany(manyDocs)
				.then(function (results) {
					db.close();
					console.log("Project update done");
					//console.log(results);
					resolve(results);
				})
			})
		});
	});
}


function updateDefaults() {
	return new Promise(function (resolve, reject) {
		MongoClient.connect(defaultConnectionString, function (err, db) {
			if (err) {
				return reject(err);
			}
			var collection = db.collection('_defaults');
			collection.updateMany(
				{ context: 'project' },
				{ $push:
					{ 'defaults.roles.project-system-admin': 'assessment-ceaa' }
				})
			.then(function (results) {
				db.close();
				console.log("_defaults collection update done");
				resolve (results);
			})
		});
	});
}


runUpdate()
.then(function(results) {
	updateDefaults();
})
.then(function(results) {
	allDone();
});

