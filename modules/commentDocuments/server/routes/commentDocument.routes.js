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
	app.route ('/api/commentdocument/:commentdocument/eao/defer').all (policy.isAllowed)
		.put (controller.eaodefer);
	app.route ('/api/commentdocument/:commentdocument/eao/accept').all (policy.isAllowed)
		.put (controller.eaoaccept);
	app.route ('/api/commentdocument/:commentdocument/eao/reject').all (policy.isAllowed)
		.put (controller.eaoreject);
	app.route ('/api/commentdocument/:commentdocument/eao/publish').all (policy.isAllowed)
		.put (controller.eaopublish);
	//
	// expect a json object with eaoNotes and/or proponentNotes, thsi is all that gets
	// copied
	//
	app.route ('/api/commentdocument/:commentdocument/notate').all (policy.isAllowed)
		.put (controller.notate);
	//
	// upload a document to this comment
	//
	app.route ('/api/commentdocument/publiccomment/:publiccomment/upload').all (policy.isAllowed)
		.post (controller.upload);
	//
	// middleware to auto-fetch parameter
	//
	app.param ('commentdocument', controller.getObject);
	//app.param ('commentDocumentId', controller.getId);
};

