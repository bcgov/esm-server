'use strict';
var MongoClient    = require('mongodb').MongoClient;
var Promise        = require('promise');
var _              = require('lodash');
var etl            = require('./etlHelper');

var argv           = require('minimist')(process.argv.slice(2));
argv.scriptName    = process.argv[1].split('/').pop();

etl.init(argv);

var connectionString = etl.getConnectString();
var fixedDocIds = [];
var processingCollectionName = 'workingTable';

function prepare() {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(connectionString, function(err, db) {
			if (err) {
				return reject(err);
			}
			var collection = db.collection('documents');
			collection.aggregate( [ { $project: {displayName:1, project:1, processed: { $literal: false }}},{ $out: processingCollectionName } ],
				function(err, result) {
					db.close();
					if (err) {
						return reject(err);
					} else {
						console.log('Prepared temporary working collection: ', processingCollectionName);
						return resolve(result);
					}
				});
		});
	});
}
function cleanUp() {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(connectionString, function(err, db) {
			var collection = db.collection(processingCollectionName);
			collection.drop(
				function(err, result) {
					db.close();
					if (err) {
						reject(err);
					} else {
						console.log("Temporary working collection '" + processingCollectionName + "' has been removed");
						resolve(result);
					}
				});
		});
	});
}

var countingCallback = function (db, processingCollection, processingElement) {
	return new Promise(function (resolve, reject) {
		var permissions = db.collection('_permissions');
		var id = processingElement._id.toString();
		permissions.find({resource: id}).count()
		.then( function (cnt) {
			processingElement.processed = true;
			processingElement.permissions = cnt;
			processingCollection.update({_id: processingElement._id}, {$set: processingElement},
			function (err, result) {
				if (err)
					return reject(err);
				return resolve(processingElement);
			});
		})
	});
};

function fixingCallback(db, processingCollection, processingElement) {
	return new Promise(function (resolve, reject) {
		var permissions = db.collection('_permissions');
		var id = processingElement._id.toString();
		var perm = composePerm(id);
		// console.log("Insert default permissions for document id", id);
		return permissions.insertMany(perm, function (err, result) {
			if (err) {
				console.log("Error ", err);
				return reject(err);
			}
			fixedDocIds.push(id);
			return resolve(resolve);
		});
	});
}


var defaultPerms = {
		'read'      : [
			'assessment-admin'
			, 'project-intake'
			, 'assessment-lead'
			, 'assessment-team'
			, 'project-epd'
			, 'project-system-admin'
		],
		'write'     : ['assessment-admin', 'project-system-admin'],
		'delete'    : ['assessment-admin', 'project-system-admin'],
		'publish'   : ['assessment-admin', 'project-system-admin'],
		'unPublish' : ['assessment-admin', 'project-system-admin']
	};

function composePerm(resourceId) {
	var results = [];
	_.forEach(defaultPerms, function (values, key) {
		_.forEach(values, function (r) {
			var np = {resource: resourceId, permission: key, role: r, "__v" : 0};
			results.push(np);
		});
	});
	return results;
}

console.log("Starting ETL.\n       ConnectionString:",connectionString);
prepare()
.then( function() {
	var query1 = {processed: false };
	return etl.runETL(connectionString, processingCollectionName, query1, countingCallback);
})
.then(function (results) {
	var query2 = {permissions: { $eq: 0}};
	return etl.runOnce(connectionString, processingCollectionName, query2, fixingCallback);
})
.then (function(results) {
	console.log("Here is a list of all documents that have had their permissions fixed: ");
	console.log('[');
	_.forEach(fixedDocIds, function(id) {
		console.log("'"+ id + "',");
	});
	console.log("]");
})
.then( function() {
	return cleanUp();
})
.then( function() {
	console.log("Ending ETL.");
	process.exit();
})
.catch( function (err) {
	console.log("Error: ", err);
	process.exit(1);
})
;
