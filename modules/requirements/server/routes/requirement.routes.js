'use strict';
// =========================================================================
//
// Routes for requirements
//
// =========================================================================
var policy     = require ('../policies/requirement.policy');
var controller = require ('../controllers/requirement.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/requirement').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/requirement/:requirementId').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/requirement').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('requirementId', controller.byId);
};

