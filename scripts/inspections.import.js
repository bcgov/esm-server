'use strict';

/**
 * Imports the Mine Inspection data from CSV (see PATH below).
 *
 * This script empties the existing collection and reloads it with current data.
 * usage:
 * 	node <script nanme>
 */

var MongoClient = require('mongodb').MongoClient;
var Promise = require('Promise');
var _ = require('lodash');
var path = require('path');
var CSVParse = require('csv-parse');
var fs = require('fs');
var model = require('../modules/inspections/server/models/inspections.model');
const PATH = 'data-inspections.csv';
const columnNames = model.columnNames;

function loadCSV() {
	return new Promise(function (resolve, reject) {
		// Now parse and go through the csv file.
		fs.readFile(PATH, 'utf8', function (err, data) {
			if (err) {
				reject(err);
				return;
			}
			var options = {delimiter: ',', columns: columnNames};
			var parse = new CSVParse(data, options, function (err, output) {
				// remove the title row
				output.shift();
				// console.log(output);
				resolve(output);
				return;
			});
		});
	});
}

var run = function () {
	var connectUrl = "mongodb://localhost:27017/mmti-dev";
	var collectionName = 'inspections';
	var collection;
	var jsonData;
	return new Promise(function (resolve, reject) {
		console.log('start');
		loadCSV()
			.then(function (results) {
				jsonData = results;
				// connect to db
				return MongoClient.connect(connectUrl);
			})
			.then(function (db) {
				// remove all entries
				collection = db.collection(collectionName);
				return collection.remove({});
			})
			.then(function () {
				// insert the records
				return collection.insertMany(jsonData);
			})
			.then(function (data) {
				console.log('end data = ', JSON.stringify(data));
				resolve(':)');
			}, function (err) {
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});
	});
};


run()
// loadCSV()
	.then(function (success) {
		console.log('success ', success);
		process.exit();
	})
	.catch(function (error) {
		console.error('error ', error);
		process.exit();
	});

