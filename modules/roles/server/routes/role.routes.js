'use strict';
// =========================================================================
//
// Routes for roles
//
// =========================================================================
var policy     = require ('../policies/role.policy');
var controller = require ('../controllers/role.controller');
var path       = require('path');
var helpers    = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));

module.exports = function (app) {
	app.route ('/api/role').all (policy.isAllowed)
		.post (function (req, res) {
			controller.newRole ()
			.then (function (role) {
				role.set (req.body);
				return role.save ();
			})
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/new/role').all (policy.isAllowed)
		.get (function (req, res) {
			controller.newRole ()
			.then (helpers.success(res), helpers.failure(res));
		});
	app.route ('/api/role/:role').all (policy.isAllowed)
		.put (function (req, res) {
			controller.getRole (req.params.role)
			.then (function (role) {
				role.set (req.body);
				return role.save ();
			})
			.then (helpers.success(res), helpers.failure(res));
		})
		.get (function (req, res) {
			controller.getRole (req.params.role)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all users in a role
	//
	app.route ('/api/users/in/role/:role').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getUsersForRole (req.params.role)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all roles in a project
	//
	app.route ('/api/roles/project/:project').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getRolesInProject (req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all users in all roles for a project
	//
	app.route ('/api/users/roles/project/:project').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getUsersInRolesInProject (req.Project)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get all projects with a role
	//
	app.route ('/api/projects/with/role/:role').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getProjectsWithRole (req.params.role)
			.then (helpers.success(res), helpers.failure(res));
		});
	//
	// get system roles only
	//
	app.route ('/api/system/roles').all (policy.isAllowed)
		.get (function (req, res) {
			controller.getSystemRoles ()
			.then (helpers.success(res), helpers.failure(res));
		});
};

