'use strict';
// =========================================================================
//
// Routes for streams
//
// =========================================================================
var policy     = require ('../policies/stream.policy');
var controller = require ('../controllers/stream.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/stream').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/stream/:streamId').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/stream').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('streamId', controller.byId);
};

