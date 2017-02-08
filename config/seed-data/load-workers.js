'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var path = require('path');

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


function loadInspectionList(inspectionList) {
	console.log("Load Inspections ");
	var Inspection = mongoose.model('Inspection');
	var Project = mongoose.model('Project');
	//see model = require('../../modules/inspections/server/models/inspections.model');
	var allPromises = [];
	_.each(inspectionList, function (pItem) {
		var p;
		p = new Promise(function (resolve, reject) {
			// console.log("Save " , pItem.inspectionNum);
			Project.find({code: pItem.projectCode})
				.then(function (project) {
					if (project.length === 0) {
						reject("Load pItem failed.. Could not locate project code '" + pItem.projectCode + "'");
					}
					if (project.length > 1) {
						reject("Load pItem failed.. Found more than one project with code '" + pItem.projectCode + "'");
					}
					pItem.projectId = project._id;
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
	var Project = mongoose.model('Project');
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
