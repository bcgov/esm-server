'use strict';
// =========================================================================
//
// Routes for activities
//
// =========================================================================
var policy     = require ('../policies/activity.policy');
var controller = require ('../controllers/activity.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/activity').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/activity/:activityId').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/activity').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('activityId', controller.byId);
};

