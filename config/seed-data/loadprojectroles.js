'use strict';
var _         = require ('lodash');
var mongoose  = require('mongoose');
var Project = mongoose.model('Project');
var Role = mongoose.model('Role');
var list      = require ('./projectroledata');

module.exports = function () {
	//
	// get all the projects
	//
	// console.log ('get all projects ');
	Project.find ({}, function (err, projects) {
		// console.log ('foudn number of projects',projects.length);
		//
		// for every project
		//
		_.each (projects, function (project) {
			//
			// keep a list of roles as they get created
			//
			var projectRoles = [];
			//
			// for each default role object
			//
			_.each (list, function (r) {
				//
				// decorate the role object
				//
				r.projectCode = project.code;
				r.projects    = [project._id];
				//
				// make the potentially new role
				//
				var role      = new Role (r);
				//
				// generate its code
				//
				role.generateCode ();
				//
				// push the code onto the list of roles for the project
				//
				projectRoles.push (role.code);
				//
				// check to see if the role already exists
				//
				console.log ('checking for role ', role.code);
				Role.find ({code:r.code}, function (err, foundrole) {
					//
					// if it does not exist, then save the one we made
					//
					if (!foundrole || _.isEmpty (foundrole)) {
						// console.log ('saving role', role.code);
						role.save ();
					}
				});
			});
			//
			// now merge the default project roles into the project
			//
			project.modRoles ('add', {
				read: projectRoles
			});
			// console.log ('saving roles to project', project.code, projectRoles);
			//
			// save the project
			//
			project.save ();
		});
	});
};
