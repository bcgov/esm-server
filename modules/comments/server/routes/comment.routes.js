'use strict';
// =========================================================================
//
// Routes for comments
//
// =========================================================================
var policy     = require ('../policies/comment.policy');
var controller = require ('../controllers/comment.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/comment').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/comment/:comment').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/comment').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('comment', controller.getObject);
	//app.param ('commentId', controller.getId);
};

