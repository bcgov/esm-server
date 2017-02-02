'use strict';

var fs                  = require ('fs');
var path                = require ('path');
var mongoose            = require ('mongoose');
var CSVParse            = require ('csv-parse');
var _                   = require ('lodash');

var ProjectController = require (path.resolve('./modules/projects/server/controllers/project.controller')),
	Project  = mongoose.model ('Project');


var importProjects = function(opts, data, startRow) {
	var ProjCtrl = new ProjectController(opts);

	return new Promise(function(resolve, reject) {

		var columnNames = ['name', 'subtitle', 'memId', 'epicId', 'lat', 'lon', 'operator', 'owner', 'commodityType', 'commodities', 'tailingsImpoundments', 'status', 'design', 'construction', 'operation', 'closure', 'reclamation', 'monitoring'];

		var rowParser = function(row) {
			//console.log('row = ', row);
			var obj = {
				name: row.name,
				subtitle: row.subtitle,
				memId: row.memId,
				epicId: row.epicId,
				lat: row.lat,
				lon: row.lon,
				operator: row.operator,
				owner: row.owner,
				commodityType: row.commodityType,
				commodities: row.commodities,
				tailingsImpoundments: row.tailingsImpoundments,
				status: row.status,
				design: row.design,
				construction: row.construction,
				operation: row.operation,
				closure: row.closure,
				reclamation: row.reclamation,
				monitoring: row.monitoring
			};
			//console.log('v1: obj = ', JSON.stringify(obj, null, 4));
			return obj;
		};

		var setValues = function(obj, row) {
			if (_.isEmpty(row.name)) {
				// do nothing...
			} else {
				if (!obj) {
					obj = new Project();
				}
				obj.name = row.name;
				obj.externalIDs = [];
				obj.activities = [];
				obj.content = [];

				// external ids..
				if (!_.isEmpty(row.memId)) {
					obj.externalIDs.push({ source: 'Import', type: 'MEM_ID', referenceID: row.memId });
				}

				if (!_.isEmpty(row.epicId)) {
					obj.externalIDs.push({ source: 'Import', type: 'EPIC_ID', referenceID: row.epicId });
				}

				try {
					obj.lat = parseFloat(row.lat);
				} catch (e) {}

				try {
					obj.lon = parseFloat(row.lon);
				} catch (e) {}

				try {
					obj.tailingsImpoundments = parseInt(row.tailingsImpoundments);
				} catch (e) {}

				obj.operator = row.operator;
				obj.ownership = row.owner;
				obj.commodityType = row.commodityType;
				obj.commodities = _.isEmpty(row.commodities) ? [] : _.split(row.commodities, ',');

				obj.status = row.status;

				// stages/phases...
				if (!_.isEmpty(row.design)) {
					obj.activities.push({ name: 'Design', order: 1, status: row.design });
				}
				if (!_.isEmpty(row.construction)) {
					obj.activities.push({ name: 'Construction', order: 2, status: row.construction });
				}
				if (!_.isEmpty(row.operation)) {
					obj.activities.push({ name: 'Operation', order: 3, status: row.operation });
				}
				if (!_.isEmpty(row.closure)) {
					obj.activities.push({ name: 'Closure', order: 4, status: row.closure });
				}
				if (!_.isEmpty(row.reclamation)) {
					obj.activities.push({ name: 'Reclamation', order: 5, status: row.reclamation });
				}
				if (!_.isEmpty(row.monitoring)) {
					obj.activities.push({ name: 'Monitoring &mp; Reporting', order: 5, status: row.monitoring });
				}

				if (!_.isEmpty(row.subtitle)) {
					obj.content.push({ source: 'Import', type: 'SUBTITLE', title: row.subtitle, text: row.subtitle, html: row.subtitle });
				}

				//console.log('setValues obj = ', JSON.stringify(obj, null, 4));
			}
		};


		var parse = new CSVParse(data, {delimiter: ',', columns: columnNames}, function(err, output){
			var promises = [];

			// assumption here is data is created in excel, and thought of as 1 based index...
			var firstRow = (startRow > 0) ? startRow - 1 : 0;

			Object.keys(output).forEach(function(key, index) {
				// row 1 - version
				// row 2 - notes
				// row 3 - headings
				// ???
				if (index >= firstRow) {
					var row = output[key];
					promises.push(rowParser(row));
				}
			});

			var importProject = function(row) {
				return new Promise(function(rs, rj) {
					var p = new Project();
					setValues(p, row);

					Project.findOne ({name: p.name}, function (err, result) {
						if (err) {
							rj(err);
						}
						if (result === null) {
							console.log("creating:", p.name);
							ProjCtrl.create(p).then(rs, rj);
						} else {
							setValues(result, row);
							result.save().then(rs, rj);
						}
					});
				});
			};

			Promise.resolve ()
				.then (function () {
					return promises.reduce (function (current, item) {
						return current.then (function () {
							return importProject(item);
						});
					}, Promise.resolve());
				})
				.then (resolve, reject);
		});
	});
};

var importDetails = function(opts, data, startRow) {
	return new Promise(function(resolve, reject) {
		Promise.resolve();
	});
};

var importCompliance = function(opts, data, startRow) {
	return new Promise(function(resolve, reject) {
		Promise.resolve();
	});
};

var importAuthorizations = function(opts, data, startRow) {
	return new Promise(function(resolve, reject) {
		Promise.resolve();
	});
};


var importMinesList = function(opts, data, startRow) {
	return new Promise(function(resolve, reject) {
		Promise.resolve();
	});
};

module.exports = function(file, req, res, opts) {
	return new Promise (function (resolve, reject) {
		// Now parse and go through this thing.
		fs.readFile(file.path, 'utf8', function(err, data) {
			if (err) {
				reject(err);
				return;
			}
			var lines, importFileType, startRow, importer;

			try {
				lines = data.split(/\r\n|\r|\n/g);
			} catch(e) {
				reject(new Error('Error performing initial parse, cannot determine import type.'));
				return;
			}

			if (_.size(lines) === 0) {
				reject(new Error('No lines found in file, cannot determine import type.'));
				return;
			}

			try {
				importFileType = lines[0].split(',')[0];
			} catch(e) {
				reject(new Error('Error reading import file type from file, cannot determine import type.'));
				return;
			}

			try {
				var val = parseInt(lines[0].split(',')[1]);
				startRow = _.isNaN(val) ? 3 : val;
			} catch(e) {
				startRow = 3;
			}

			switch(importFileType) {
				case 'mmti-projects-v1':
					importer = importProjects;
					break;
				case 'mmti-details-v1':
					importer = importDetails;
					break;
				case 'mmti-compliance-v1':
					importer = importCompliance;
					break;
				case 'mmti-authorizations-v1':
					importer = importAuthorizations;
					break;
				case 'mmti-mines-list-v1':
					importer = importMinesList;
					break;
			}

			if (!importer) {
				reject(new Error("Import type '" + importFileType + "' is not supported."));
				return;
			}

			resolve(importer(opts, data, startRow));

		});
	});
};
