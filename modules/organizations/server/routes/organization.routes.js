'use strict';
// =========================================================================
//
// Routes for organizations
//
// =========================================================================
var policy     = require ('../policies/organization.policy');
var controller = require ('../controllers/organization.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/organization').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// base items only (no project association)
	//
	app.route ('/api/base/organization').all (policy.isAllowed)
		.get  (controller.base);
	//
	// model routes
	//
	app.route ('/api/organization/:organization').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/organization').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('organization', controller.getObject);
	// app.param ('organizationId', controller.getId);
};

