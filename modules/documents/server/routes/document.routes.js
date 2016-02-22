'use strict';
// =========================================================================
//
// Routes for documents
//
// =========================================================================
var policy     = require ('../policies/document.policy');
var controller = require ('../controllers/document.controller');
var Project    = require ('../../../projects/server/controllers/project.controller');
var helpers    = require ('../../../core/server/controllers/core.helpers.controller');

module.exports = function (app) {
	//
	// collection routes
	//
	app.route ('/api/documents')//.all (policy.isAllowed)
		.get  (controller.list);
		//.post (controller.create);

	app.route ('/api/documents/:project')//.all (policy.isAllowed)
		.get  (controller.getDocumentsForProjectAndReturn);

	app.route ('/api/documents/types/:projectid')//.all (policy.isAllowed)
		.get  (controller.getDocumentTypesForProjectAndReturn);

	app.route ('/api/documents/folderNames/:projectid')//.all (policy.isAllowed)
		.get  (controller.getDocumentFolderNamesForProjectAndReturn);

	app.route ('/api/documents/versions/:documentid')//.all (policy.isAllowed)
		.get  (controller.getDocumentVersionsAndReturn);

	app.route ('/api/documents/approveAndDownload/:document')//.all (policy.isAllowed)
		.put  (controller.approveAndDownload);
	//
	// model routes
	//
	app.route ('/api/document/:document').all (policy.isAllowed)
		.get    (controller.read)
		.put    (controller.update)
		.delete (controller.delete);

	// Find a document Folder (scrapeAndSearch)
	app.route ('/api/scrapeAndSearch')//.all (policy.isAllowed)
		.get (controller.scrapeAndSearch);

	// Find a specific document (populateReviewDocuments)
	app.route ('/api/populateReviewDocuments')//.all (policy.isAllowed)
		.get (controller.populateReviewDocuments);

	//
	// upload a document
	//
	app.route ('/api/document/:project/upload')//.all (policy.isAllowed)
		.post (controller.upload);

	// Fetch doc
	app.route ('/api/document/:document/fetch').all (policy.isAllowed)
		.get (controller.fetchd);

	//
	// middleware to auto-fetch parameter
	//
	app.param ('document', controller.getObject);
	//app.param ('documentId', controller.getId);
};

