'use strict';
// =========================================================================
//
// Routes for publicComments
//
// =========================================================================
var policy     = require ('../policies/publicComment.policy');
var controller = require ('../controllers/publicComment.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/publicComment').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/publicComment/:publicComment').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/publicComment').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('publicComment', controller.getObject);
	//app.param ('publicCommentId', controller.getId);
};

