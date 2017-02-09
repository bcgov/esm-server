'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var path = require('path');
var Organization = mongoose.model('Organization');
var Project = mongoose.model('Project');
var Inspection = mongoose.model('Inspection');
var Authorization = mongoose.model('Authorization');

var LoadWorker = require('./load-base');
var base = new LoadWorker();


var didProjectsUpdateHack = false;

module.exports = function() {
	console.log("Load worker");
	loadOrganization()
		.then(function(results) {
			return  loadProjects();
		})
		.then(function(results) {
			if(results.seedData) {
				didProjectsUpdateHack = true;
			}
			return  loadInspections(didProjectsUpdateHack);
		})
		.then(function(results) {
			return  loadAuthorizations(didProjectsUpdateHack);
		})
		.catch(function(reason){
			console.error(reason);
		})
};

function loadOrganization() {
	var fPath = path.resolve(__dirname, 'load-organizations-data.js');
	return base.loader(fPath, Organization, createOrganization, false);
}

function loadProjects() {
	var fPath = path.resolve(__dirname, 'load-projects-data.js');
	return base.loader(fPath, Project, createProject, false);
}

function loadInspections(forceUpdate) {
	var fPath = path.resolve(__dirname, 'load-inspections-data.js');
	return base.loader(fPath, Inspection, createInspection, forceUpdate);
}
function loadAuthorizations(forceUpdate) {
	var fPath = path.resolve(__dirname, 'load-authorizations-data.js');
	return base.loader(fPath, Authorization, createAuthorization, forceUpdate);
}

function createOrganization(base, pItem) {
	return new Promise(function (resolve, reject) {
		var p = new Organization(pItem);
		p.save(function (err, doc, numAffected) {
			if (err) {
				reject(err);
			}
			resolve(p);
		});
	});
}


function createProject(base, pItem) {
	return new Promise(function (resolve, reject) {
		var p = new Project(pItem);
		p.save(function (err, doc, numAffected) {
			if (err) {
				reject(err);
			}
			resolve(p);
		});
	});
}

function createInspection(base, pItem) {
	return new Promise(function (resolve, reject) {
		var queryFor = pItem.projectName;
		base.findProject(queryFor)
			.then(function (project) {
				if (!project) {
					resolve();
				}
				pItem.projectId = project._id;
				pItem.projectCode = project.code;
				pItem.inspectionName = pItem.agencyCode + "-" + pItem.inspectionNum + " (" + pItem.agencyName + ")";
				var a = new Inspection(pItem);
				a.save(function (err, doc, numAffected) {
					if (err) {
						reject(err);
					}
					resolve(a);
				});
			});
	});
}

function createAuthorization(base, pItem) {
	return new Promise(function (resolve, reject) {
		var queryFor = pItem.projectName;
		base.findProject(queryFor)
			.then(function (project) {
				if (!project) {
					resolve();
				}
				pItem.projectId = project._id;
				pItem.projectCode = project.code;
				var a = new Authorization(pItem);
				a.save(function (err, doc, numAffected) {
					if (err) {
						reject(err);
					}
					resolve(a);
				});
			});
	});
}

