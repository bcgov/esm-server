'use strict';
// =========================================================================
//
// Routes for roles
//
// =========================================================================
var policy     = require ('../policies/role.policy');
var controller = require ('../controllers/role.controller');

module.exports = function (app) {
	app.route ('/api/role').all (policy.isAllowed)
		.post (controller.addRoleRoute);
	app.route ('/api/role/:role').all (policy.isAllowed)
		.put (controller.updateRoleRoute)
		.get (controller.getRoleRoute);
	//
	// get all users in a role
	//
	app.route ('/api/users/in/role/:role').all (policy.isAllowed)
		.get (controller.getUsersForRoleRoute);
	//
	// get all roles in a project
	//
	app.route ('/api/roles/project/:project').all (policy.isAllowed)
		.get (controller.getRolesInProjectRoute);
	//
	// get all users in all roles for a project
	//
	app.route ('/api/users/roles/project/:project').all (policy.isAllowed)
		.get (controller.getUsersInRolesInProjectRoute);
	//
	// get all projects with a role
	//
	app.route ('/api/projects/with/role/:role').all (policy.isAllowed)
		.get (controller.getProjectsWithRoleRoute);
	//
	// get system roles only
	//
	app.route ('/api/system/roles').all (policy.isAllowed)
		.get (controller.getSystemRolesRoute);
};

