'use strict';

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var projectList = require('./load-projects-data');
var _ = require('lodash');


module.exports = function () {
	var allPromises = [];
	_.each(projectList, function (project) {
		var p = new Promise(function(resolve, reject) {
			console.log("Save project", project.code);
			var p = new Project(project);
			p.save();
			resolve(p);
		});
		allPromises.push(p);
	});
	return Promise.all(allPromises);
};
