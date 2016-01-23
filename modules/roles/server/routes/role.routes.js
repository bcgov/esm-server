'use strict';
// =========================================================================
//
// Routes for roles
//
// =========================================================================
var policy     = require ('../policies/role.policy');
var controller = require ('../controllers/role.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/role').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/role/:role').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/role').all (policy.isAllowed)
		.get (controller.new);

	//
	// add a user to a role/group
	//
	app.route ('/api/role/:role/add/user/:userId').all (policy.isAllowed)
		.put (controller.addUserToRole);

	//
	// middleware to auto-fetch parameter
	//
	app.param ('role', controller.getObject);
	// app.param ('roleId', controller.getId);
};

