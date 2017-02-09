'use strict';

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var projectList = require('./load-projects-data');
var _ = require('lodash');


module.exports = function() {
	console.log("This module has been replaced by load-worker.  Once fully tested we'll delete this module.");
	return Promise.resolve();
};

function obsolete() {
	var allPromises = [];
	_.each(projectList, function (project) {
		var p = new Promise(function(resolve, reject) {
			var p = new Project(project);
			p.save();
			resolve(p);
		});
		allPromises.push(p);
	});
	return Promise.all(allPromises);
}
