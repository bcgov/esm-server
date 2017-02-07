'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var CSVParse = require('csv-parse');
var Project = mongoose.model('Project');
var Authorization = mongoose.model('Authorization');
//see model = require('../../modules/authorizations/server/models/authorizations.model');
var fs = require('fs');
var path = require('path');
const PATH = 'load-authorizations-data.csv';

const columnNames = [
	"agencyCode",
	"projectCode",
	"authorizationID",
	"documentName",
	"authorizationDate",
	"documentType",
	"documentStatus",
	"documentURL",
	"authorizationSummary",
	"followUpDocumentNames",
	"followUpDocumentUrls"
];

module.exports = load;

function loadCSV() {
	return new Promise(function (resolve, reject) {
		// Now parse and go through the csv file.
		fs.readFile(path.resolve(__dirname, PATH), 'utf8', function (err, data) {
			if (err) {
				console.log("Load CSV error:", err);
				reject(err);
				return;
			}
			var options = {delimiter: ',', columns: columnNames};
			var parse = new CSVParse(data, options, function (err, output) {
				// remove the title row
				output.shift();
				console.log("Parsed CSV line count:", output.length);
				resolve(output);
				return;
			});
		});
	});
}

const agencyMap = {
	'ENV': {name: 'Ministry of Environment', act: "Environmental Management Act"},
	'MEM': {name: 'Ministry of Energy and Mines', act: "Mines Act"},
	'EAO': {name: "Environmental Assessment Office", act: "Environmental Assessment Act"}
};


function transform(jsonData) {
	_.forEach(jsonData, function (authorization) {
		var agency = agencyMap[authorization.agencyCode];
		if (!agency) {
			throw new Error("Import failed on unexpected organization code " + authorization.agencyCode);
		}
		authorization.agencyName = agency.name;
		authorization.actName = agency.act;

		try {
			if (authorization.followUpDocumentNames && authorization.followUpDocumentNames.length > 0) {
				if (authorization.followUpDocumentUrls && authorization.followUpDocumentUrls.length > 0) {
					var names = authorization.followUpDocumentNames.split(";");
					var urls = authorization.followUpDocumentUrls.split(";");

					if (names.length !== urls.length) {
						throw new Error("Import authorizations failed. The number of follow up document names does not match the number of urls");
					}
					authorization.followUpDocuments = [];
					delete authorization.followUpDocumentNames;
					delete authorization.followUpDocumentUrls;
					for (var i = 0; i < names.length; i++) {
						var e = {name: names[i], ref: urls[i]};
						authorization.followUpDocuments.push(e);
					}
				} else {
					throw new Error("Import authorizations failed. There are followUpDocumentNames but no followUpDocumentUrls");
				}
			}
		} catch (e) {
			console.error(e);
			throw e;
		}
	});
	return jsonData;
}

function load() {
	return new Promise(function (resolve, reject) {
		console.log('Load Authorizations start');
		loadCSV()
			.then(function (results) {
				return transform(results);
			})
			.then(function (results) {
				return loadAuthorizations(results);
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
	var allPromises = [];
	_.each(authorizationList, function (pItem) {
		var p;
		p = new Promise(function (resolve, reject) {
			Project.find({code: pItem.projectCode}, function (err, project) {
					if(err) {
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
					a.save(function(err, doc, numAffected) {
						if(err) {
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