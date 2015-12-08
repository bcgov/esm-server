'use strict';
// =========================================================================
//
// Routes for commentDocuments
//
// =========================================================================
var policy     = require ('../policies/commentDocument.policy');
var controller = require ('../controllers/commentDocument.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/commentDocument').all (policy.isAllowed)
		.get  (controller.list)
		.post (controller.create);
	//
	// model routes
	//
	app.route ('/api/commentDocument/:commentDocument').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);
	app.route ('/api/new/commentDocument').all (policy.isAllowed)
		.get (controller.new);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('commentDocument', controller.getObject);
	//app.param ('commentDocumentId', controller.getId);
};

