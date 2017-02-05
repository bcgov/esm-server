'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
//var Promise = require('Promise');
var CSVParse = require('csv-parse');
var Project = mongoose.model('Project');
var Inspection = mongoose.model('Inspection');
//see model = require('../../modules/inspections/server/models/inspections.model');
var fs = require('fs');
var path = require('path');
const PATH = 'load-inspections-data.csv';

const columnNames = [
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
				// console.log(output);
				resolve(output);
				return;
			});
		});
	});
}
const orgMap = {
	'ENV': 'Ministry of Environment',
	'MEM': 'Ministry of Energy and Mines'
};

function transform(jsonData) {
	_.forEach(jsonData, function (inspection) {
		var orgName = orgMap[inspection.orgCode];
		if (!orgName) {
			throw new Error("Import failed on unexpected organization code", inspection.orgCode);
		}
		inspection.inspectionName = inspection.inspectionNum + "-" + inspection.orgCode + " (" + orgName + ")";
	});
	return jsonData;
}

function load() {
	var collectionName = 'inspections';
	var inspectionList;
	return new Promise(function (resolve, reject) {
		console.log('Load Inspections start');
		loadCSV()
			.then(function (results) {
				return transform(results);
			})
			.then(function (results) {
				inspectionList = results;
				return loadInspections(inspectionList);
			})
			.then(function () {
				console.log('Load Inspections end');
				resolve(':)');
			})
			.catch(function (err) {
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});
	});
}


function loadInspections(inspectionList) {
	// console.log("BG load inspections", inspectionList);
	_.each(inspectionList, function (inspection) {
		console.log("BG load inspection", inspection.projectCode, inspection.inspectionName);
		Project.find({code: inspection.projectCode}, function (err, project) {
			if (err) {
				throw err;
			}
			if (project.length === 0) {
				throw new Error("Load inspections failed.. Could not locate project code '" + inspection.projectCode + "'");
			}
			if (project.length > 1) {
				throw new Error("Load inspections failed.. Found more than one project with code '" + inspection.projectCode + "'");
			}
			inspection.projectId = project._id;
			// console.log("Save inspection", inspection);
			(new Inspection(inspection)).save();
		});
	});
}
