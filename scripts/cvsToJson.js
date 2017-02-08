"use strict";
var _ = require('lodash');
var CSVParse = require('csv-parse');
var fs = require('fs');
var path = require('path');

run();

function run() {
	preProcess(new Inspections());
	preProcess(new Authorization());
}

const agencyMap = {
	'ENV': {name: 'Ministry of Environment', act: "Environmental Management Act"},
	'MEM': {name: 'Ministry of Energy and Mines', act: "Mines Act"},
	'EAO': {name: "Environmental Assessment Office", act: "Environmental Assessment Act"}
};

function ImporterBase() {
	this.dateValidate = function (val) {
		var s = Date.parse(val);
		if (isNaN(s)) {
			console.log("Invalidate Date %j", val);
			throw "Invalid date " + val;
		}
	};

	this.getAgency = function (code) {
		var agency = agencyMap[code];
		if (!agency) {
			throw "Import failed on unexpected organization code " + code;
		}
		return agency;
	};

	this.processRelated = function (rowNames,rowUrls) {
		var followUpDocuments = [];
		try {
			if (rowNames && rowNames.length > 0) {
				if (rowUrls && rowUrls.length > 0) {
					var names = rowNames.split(";");
					var urls = rowUrls.split(";");

					if (names.length !== urls.length) {
						throw new Error("Import failed. The number of follow up document names does not match the number of urls");
					}
					for (var i = 0; i < names.length; i++) {
						var e = {name: names[i], ref: urls[i]};
						followUpDocuments.push(e);
					}
				} else {
					throw new Error("Import failed. There are followUpDocumentNames but no followUpDocumentUrls");
				}
			}
		} catch (e) {
			console.error(e);
			throw e;
		}
		return followUpDocuments;
	}
}


function Authorization() {
	ImporterBase.call(this);
	this.INPUT = path.resolve(__dirname, 'load-authorizations-data.csv');
	this.OUTPUT = path.resolve(__dirname, '..', 'config', 'seed-data', 'load-authorizations-data.json');
	this.getName = function() {return 'Authorizations';}
	console.log("INPUT", this.INPUT);
	console.log("OUTPUT", this.OUTPUT);

	this.columnNames = [
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
	this.transform = function (jsonData) {
		var _this = this;
		_.forEach(jsonData, function (json) {
			if(!json.projectCode || json.projectCode.length ==0) {
				throw "Row missing projectCode";
			}
			var agency = _this.getAgency(json.agencyCode);
			json.agencyName = agency.name;
			json.actName = agency.act;
			json.followUpDocuments = _this.processRelated(json.followUpDocumentNames, json.followUpDocumentUrls);
			delete json.followUpDocumentNames;
			delete json.followUpDocumentUrls;
			_this.dateValidate(json.authorizationDate);
		});
		return jsonData;
	}
}
Authorization.prototype = Object.create(ImporterBase.prototype);
Authorization.prototype.constructor = Authorization;

//see model = require('../../modules/inspections/server/models/inspections.model');
function Inspections() {
	ImporterBase.call(this);
	this.getName = function() {return 'Inspections';}
	this.INPUT = path.resolve(__dirname, 'load-inspections-data.csv');
	this.OUTPUT = path.resolve(__dirname, '..', 'config', 'seed-data', 'load-inspections-data.json');

	console.log("INPUT", this.INPUT);
	console.log("OUTPUT", this.OUTPUT);
	this.columnNames = [
		"projectCode",
		"orgCode",
		"inspectionNum",
		"inspectionDate",
		"inspectorInitials",
		"inspectionSummary",
		"recentFollowUp",
		"inspectionDocumentName",
		"inspectionDocumentURL",
		"followUpDocumentNames",
		"followUpDocumentUrls",
		"authorizationID"
	];
	this.transform = function (jsonData) {
		var _this = this;
		_.forEach(jsonData, function (json) {
			if(!json.projectCode || json.projectCode.length ==0) {
				throw "Row missing projectCode";
			}
			var agency = _this.getAgency(json.orgCode);
			json.inspectionName = json.inspectionNum + "-" + json.orgCode + " (" + agency.name + ")";
			json.followUpDocuments = _this.processRelated(json.followUpDocumentNames, json.followUpDocumentUrls);
			delete json.followUpDocumentNames;
			delete json.followUpDocumentUrls;
			_this.dateValidate(json.inspectionDate);
		});
		return jsonData;
	}
}
Inspections.prototype = Object.create(ImporterBase.prototype);
Inspections.prototype.constructor = Inspections;

function loadCSV(importer) {
	return new Promise(function (resolve, reject) {
		// Now parse and go through the csv file.
		fs.readFile(importer.INPUT, 'utf8', function (err, data) {
			if (err) {
				console.log("Load CSV error:", err);
				reject(err);
				return;
			}
			var options = {delimiter: ',', columns: importer.columnNames};
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

function preProcess(importer) {
	return new Promise(function (resolve, reject) {
		console.log('Pre Process Inspections start');
		loadCSV(importer)
			.then(function (results) {
				return importer.transform(results);
			})
			.then(function (results) {
				var output ={
					name: importer.getName(),
					data: results,
					date: Date.now()
				}
				return new Promise(function (resolve, reject) {
					var json = JSON.stringify(output, null, 2);
					fs.writeFile(importer.OUTPUT, json, {encoding: 'utf8'}, function (err, data) {
						if (err) reject(err);
						console.log("JSON saved to file ", importer.OUTPUT);
						resolve();
					});
				})

			})
			.catch(function (err) {
				console.error('ERROR: end err = ', err);
				reject(err);
			});
	});
}

