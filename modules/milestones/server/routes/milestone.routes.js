'use strict';
// =========================================================================
//
// Routes for milestones
//
// =========================================================================
var policy     = require ('../policies/milestone.policy');
var controller = require ('../controllers/milestone.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/milestone').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/milestone/:milestoneId').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/milestone').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('milestoneId', controller.byId);
};

