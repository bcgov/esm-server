'use strict';

var mongoose = require ('mongoose');
var Project = mongoose.model ('Project');
var projectList = require ('./load-projects-data');
var _        = require ('lodash');

module.exports = function () {
	// console.log("BG load projects", projectList);
	_.each (projectList, function (project) {
		// console.log("BG load project", project);
		Project.find ({_id:project._id}, function (err, result) {
			if (result.length === 0) {
				// console.log("BG save project", project);
				var p = new Project (project);
				p.save ();
			}
		});
	});
};
