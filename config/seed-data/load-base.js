'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var Integration  = mongoose.model ('Integration');


module.exports = LoadWorker;

function LoadWorker () {
	const _this = this;
	this.loader = function (fPath, loadWorker) {
		return _this.loadJSON(fPath)
			.then(function (results) {
				return _this.checkIntegration(results);
			})
			.then(function(results) {
				if(! results.needsUpdate) {
					results.seedData = false;
					return results;
				} else {
					return loadWorker(results.data)
						.then( function(loadResults) {
							results.seedData = true;
							return results;
						});
				}
			})
			.then(function(results) {
				if(results.seedData) {
					return _this.saveIntegration(results);
				}
			})
			.catch(function (err) {
				console.error(err);
			});
	};

	this.loadJSON = function (fPath) {
		return new Promise(function (resolve, reject) {
			// Now parse and go through the csv file.
			fs.readFile(fPath, 'utf8', function (err, data) {
				if (err) {
					console.log("Load json file error:", err);
					reject(err);
				} else {
					data = JSON.parse(data);
					resolve(data);
				}
			});
		});
	};

	this.checkIntegration = function (results) {
		return new Promise(function (resolve, reject) {
			var name = results.name.toLowerCase();
			Integration.findOne({module: name}, function (err, integrationRow) {
				if (err) {
					console.error('Error seeding ' + name + ' : ', err);
					reject(err);
				}
				var loadedDataDate = results.date;
				var dataDate = integrationRow && integrationRow.dataDate && integrationRow.dataDate.getTime();
				results.needsUpdate = (!dataDate || dataDate < loadedDataDate);
				// console.log("Dates", dataDate, loadedDataDate, results.needsUpdate);
				if (!results.needsUpdate) {
					console.log('Seeding :' + name + ' has already been performed');
				}
				resolve(results);
			});
		});
	};

	this.saveIntegration = function (results) {
		return new Promise(function (resolve, reject) {
			var name = results.name.toLowerCase();
			console.log('Seeded :' + name);
			var query = {module: name};
			var update = {dataDate: results.date};
			var options = {new: true, upsert: true};
			Integration.findOneAndUpdate(query, update, options, function (err, doc) {
				if (err) {
					reject(err);
				}
				resolve(results);
			});
		});
	};
}