'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var path = require('path');
var Project = mongoose.model('Project');

var LoadWorker = require('./load-base');
var base = new LoadWorker();

module.exports.inspections = loadInspections;
module.exports.authorizations = loadAuthorizations;

function loadInspections() {
	var fPath = path.resolve(__dirname, 'load-inspections-data.json');
	return base.loader(fPath, loadInspectionList);
}
function loadAuthorizations() {
	var fPath = path.resolve(__dirname, 'load-authorizations-data.json');
	return base.loader(fPath, loadAuthorizationList);
}

function clearCollection(collection) {
	collection.remove({}, function(err) {
		if (err) {
			console.log(err)
		} else {
			console.log(collection.modelName,' cleared');
		}
	});
}

function findProject(queryFor) {
	return Project.find({name: queryFor})
		.then(function (project) {
			if (project.length === 0) {
				console.log("Load pItem failed.. Could not locate project  '" + queryFor + "'");
				return null;
			}
			if (project.length > 1) {
				console.log("Load pItem failed.. Found more than one project with  '" + queryFor + "'");
				return null;
			}
			return project[0];
		});
}
function loadInspectionList(inspectionList) {
	console.log("Load Inspections ");
	var Inspection = mongoose.model('Inspection');
	clearCollection(Inspection);
	//see model = require('../../modules/inspections/server/models/inspections.model');
	var allPromises = [];
	_.each(inspectionList, function (pItem) {
		var p = new Promise(function (resolve, reject) {
			// console.log("Save " , pItem.inspectionNum);
			var queryFor = pItem.projectName;
			findProject(queryFor)
				.then(function (project) {
					if (!project) {
						reject();
					}
					pItem.projectId = project._id;
					pItem.projectCode = project.code;
					//console.log("Save inspection pItem", pItem.inspectionNum);
					var a = new Inspection(pItem);
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


function loadAuthorizationList(authorizationList) {
	console.log("Load authorizations");
	var Authorization = mongoose.model('Authorization');
	clearCollection(Authorization);
	var allPromises = [];
	_.each(authorizationList, function (pItem) {
		var p;
		p = new Promise(function (resolve, reject) {
			var queryFor = pItem.projectName;
			findProject(queryFor)
				.then(function (project) {
					if (!project) {
						reject("No project "+ queryFor);
					}
					pItem.projectId = project._id;
					pItem.projectCode = project.code;
				console.log("Save authorization pItem", pItem.projectName, 	pItem.projectId);
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
