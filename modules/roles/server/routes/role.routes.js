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
	// get all users in a role
	//
	app.route ('/api/users/in/role/:role').all (policy.isAllowed)
		.get (controller.getUsersForRoleRoute);

};

