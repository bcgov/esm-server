'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var CSVParse = require('csv-parse');
var Project = mongoose.model('Project');
var Authorization = mongoose.model('Authorization');
//see model = require('../../modules/authorizations/server/models/authorizations.model');
var fs = require('fs');
var path = require('path');
const PATH = 'load-authorizations-data.json';


module.exports = load;

function loadJSON() {
	return new Promise(function (resolve, reject) {
		// Now parse and go through the csv file.
		fs.readFile(path.resolve(__dirname, PATH), 'utf8', function (err, data) {
			if (err) {
				console.log("Load CSV error:", err);
				reject(err);
				return;
			}
			data = JSON.parse(data);
			resolve(data);
		});
	});
}

function load() {
	return new Promise(function (resolve, reject) {
		console.log('Load Authorizations start');
		loadJSON()
			.then(function (results) {
				console.log("Check date here ", results.date);
				return loadAuthorizations(results.data);
			})
			.then(function (results) {
				console.log('Load Authorizations end', results.length);
				resolve(':)');
			})
			.catch(function (err) {
				console.log('ERROR: end err = ', err);
				reject(err);
			});
	});
}

function loadAuthorizations(authorizationList) {
	var Authorization = mongoose.model('Authorization');
	var allPromises = [];
	_.each(authorizationList, function (pItem) {
		var p;
		p = new Promise(function (resolve, reject) {
			Project.find({code: pItem.projectCode}, function (err, project) {
				if (err) {
					return reject(err);
				}
				if (project.length === 0) {
					reject("Load pItem failed.. Could not locate project code '" + pItem.projectCode + "'");
				}
				if (project.length > 1) {
					reject("Load pItem failed.. Found more than one project with code '" + pItem.projectCode + "'");
				}
				pItem.projectId = project._id;
				console.log("Save authorization pItem", pItem.projectCode);
				var a = new Authorization(pItem);
				a.save(function (err, doc, numAffected) {
					if (err) {
						reject(err);
					}
					resolve(a);
				});
			});
		});
		allPromises.push(p);
	});
	return Promise.all(allPromises);
}