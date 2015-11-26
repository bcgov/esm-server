'use strict';
// =========================================================================
//
// Routes for entities
//
// =========================================================================
var policy     = require ('../policies/entity.policy');
var controller = require ('../controllers/entity.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/entity').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/entity/:entity').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/entity').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('entity', controller.getObject);
	// app.param ('entityId', controller.getId);
};

