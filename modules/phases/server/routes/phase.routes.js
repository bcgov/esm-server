'use strict';
// =========================================================================
//
// Routes for phases
//
// =========================================================================
var policy     = require ('../policies/phase.policy');
var controller = require ('../controllers/phase.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/phase').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/phase/:phase').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/phase').all (policy.isAllowed)
		.get (controller.new);
	//
	// actions
	//
	//
	// middleware to auto-fetch parameter
	//
	app.param ('phase', controller.getObject);
	// app.param ('phaseId', controller.getId);
};

