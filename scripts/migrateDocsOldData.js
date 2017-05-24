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

console.log("Starting migration.");
function allDone() {
	console.log("Done");
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

/*
Run the update on a set of documents. Returns (promise) the count of remaining records needing update.
 */
function partialUpdate(collectionName, query, updateCallback) {
	console.log("Begin with query: ", query);
	return new Promise(function (resolve, reject) {
		MongoClient.connect(defaultConnectionString, function (err, db) {
			if (err) {
				return reject(err);
			}
			var collection = db.collection(collectionName);
			var pending = 0;
			var limit =  2000;
			collection.find(query).limit(limit).forEach(function (document) {
				pending++;
				updateCallback(document)
				.then(function (d) {
					collection.update({_id: d._id}, {$set: d}, function (err, result) {
						if (err) {
							return reject(err);
						}
						//console.log(document._id + " was updated");
						pending--;
						if (pending === 0) {
							collection.find(query).count()
							.then(function (cnt) {
								console.log("               Done one set for query cnt", query, cnt);
								db.close();
								return resolve(cnt);
							})
						}
					});
				})
			});
		});
	});
}

/*
Run until there are no more records that match the query.
 */
function runOneUpdate(collectionName, query, updateDocCallback) {
	partialUpdate(collectionName, query, updateDocCallback)
	.then(function (cnt) {
		console.log("runOneUpdate  query ", query, cnt);

		if (cnt > 0) {
			runOneUpdate.bind(null)(collectionName, query, updateDocCallback);
		} else {
			console.log("Done for this query ", query);
		}
	});
}


/*
 Update the dateUploaded, if empty, from the old data, if not empty, stored during an earlier ETL
 */
var query1 = { $and: [ {dateUploaded: {$eq: null}}, {oldData: {$ne: ''}} ] };
runOneUpdate('documents', query1, function (document) {
	return new Promise(function (resolve, reject) {
		try {
			if (_.isEmpty(document.dateUploaded) && !_.isEmpty(document.oldData)) {
				var od = JSON.parse(document.oldData);
				var dt = moment(od.WHEN_CREATED, "MM/DD/YYYY HH:mm").toDate();
				//console.log(document._id + " set dateUploaded (old,new)", od.WHEN_CREATED, dt);
				document.dateUploaded = dt;
			}
			return resolve(document);
		} catch (ex) {
			console.log('Error parsing WHEN_CREATED from oldData', ex, JSON.stringify(document.oldData));
			reject(ex);
		}
	});
});


/*
 Update the displayName, if empty, based on the content in the documentFileName (first choice) or internalOriginalName (second choice)
 */
var query2 = { $and: [ {displayName: {$eq: ''}}, { $or: [{documentFileName: {$ne: ''}}, {internalOriginalName: {$ne: ''}} ] } ] };
runOneUpdate('documents', {displayName: {$eq: ''}}, function (document) {
	return new Promise(function (resolve, reject) {
		if (_.isEmpty(document.displayName)) {
			document.displayName = document.documentFileName || document.internalOriginalName;
			//console.log(document._id + " displayName '" + document.displayName + "' documentFileName '" + document.documentFileName + "', '" + document.internalOriginalName + "'");
		}
		return resolve(document);
	});
});
