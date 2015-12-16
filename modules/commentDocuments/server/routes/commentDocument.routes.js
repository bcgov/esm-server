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
	// app.route ('/api/commentdocument').all (policy.isAllowed)
		// .get  (controller.list)
		// .post (controller.create);
	//
	// model routes
	//
	app.route ('/api/commentdocument/:commentdocument').all (policy.isAllowed)
		.get    (controller.read)
		// .put    (controller.update)
		.delete (controller.delete);
	// app.route ('/api/new/commentdocument').all (policy.isAllowed)
		// .get (controller.new);
	//
	// action routes
	//
	app.route ('/api/commentdocument/:commentdocument/eaodefer').all (policy.isAllowed)
		.put (controller.eaodefer);
	app.route ('/api/commentdocument/:commentdocument/eaoaccept').all (policy.isAllowed)
		.put (controller.eaoaccept);
	app.route ('/api/commentdocument/:commentdocument/eaoreject').all (policy.isAllowed)
		.put (controller.eaoreject);
	app.route ('/api/commentdocument/:commentdocument/eaopublish').all (policy.isAllowed)
		.put (controller.eaopublish);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('commentdocument', controller.getObject);
	//app.param ('commentDocumentId', controller.getId);
};

