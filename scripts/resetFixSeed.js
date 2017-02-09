"use strict";
var MongoClient = require('mongodb').MongoClient;

run();
function run() {
	var connectUrl = "mongodb://localhost:27017/mmti-dev";
	var db, collection;
	console.log('start');
	Promise.resolve()
		.then(function (results) {
			console.log('get db');
			return MongoClient.connect(connectUrl);
		})
		.then(function (dbase) {
			console.log('have db');
			db = dbase;
			collection = db.collection('integrations');
			console.log("Have collection now remove");
			collection.remove({module: 'inspections'});
		})
		.then(function () {
			console.log("Have collection now remove authorizations");
			collection.remove({module: 'authorizations'});
		})
		.then(function() {
			db.close();
		})
		.catch(function (reason) {
			console.log(reason);
		});
};

