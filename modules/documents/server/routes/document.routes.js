'use strict';
// =========================================================================
//
// Routes for documents
//
// =========================================================================
var controller = require ('../controllers/document.controller');
var Project    = require ('../../../projects/server/controllers/project.controller');
var routes = require ('../../../core/server/controllers/cc.routes.controller');
var policy = require ('../../../core/server/controllers/cc.policy.controller');

module.exports = function (app) {
	app.route ('/api/documents/postproc/mapdocumentstoprojects').all (policy ('guest')) //etl
  		.get (function (req, res) {
			controller.mapDocumentsToProjects(req, res)
			.then (routes.success(res), routes.failure(res));
	});
	//
	// collection routes
	// cc: converted
	// app.route ('/api/documents')//.all (policy ('guest'))
	// 	.get  (controller.list);
	// 	//.post (controller.create);

	// Import via CSV
	app.route ('/api/documents/import').all (policy ('guest')) //etl
		.post (controller.loadDocuments);

	app.route ('/api/documents/:documentid/relate/:projectid/').all (policy ('guest')) // etl
		.post (controller.mapDocumentToProject);
	// cc: converted
	// app.route ('/api/documents/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentsForProjectAndReturn);
	// cc: converted
	// app.route ('/api/documents/types/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentTypesForProjectAndReturn);
	// cc: converted
	// app.route ('/api/documents/memtypes/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentTypesForProjectMEMAndReturn);
	// cc: converted
	// app.route ('/api/documents/subtypes/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentSubTypesForProjectAndReturn);
	// cc: converted
	// app.route ('/api/documents/folderNames/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentFolderNamesForProjectAndReturn);

	// app.route ('/api/documents/versions/:documentid').all (policy ('guest'))
	// 	.get  (controller.getDocumentVersionsAndReturn);

	// app.route ('/api/documents/approveAndDownload/:document').all (policy ('user')) // nope
	// 	.put  (controller.approveAndDownload);
	// //
	// model routes
	//
	// app.route ('/api/document/:document').all (policy ('guest'))
	// 	.get    (controller.read)
	// 	.put    (controller.update)
	// 	.delete (controller.delete);

	// Find a document Folder (scrapeAndSearch)
	// app.route ('/api/scrapeAndSearch').all (policy ('guest'))
	// 	.get (controller.scrapeAndSearch);

	// // Find a specific document (populateReviewDocuments)
	// app.route ('/api/populateReviewDocuments').all (policy ('guest'))
	// 	.get (controller.populateReviewDocuments);

	//
	// upload a document
	//
	// app.route ('/api/odocument/:project/upload').all (policy ('guest'))
	// 	.post (controller.upload);

	// // Fetch doc
	// app.route ('/api/document/:document/fetch').all (policy ('guest'))
	// 	.get (controller.fetchd);
	// cc: converted
	// app.route ('/api/olddocumentlist').all (policy ('guest'))
	// 	.put (controller.getlist);
	//
	// middleware to auto-fetch parameter
	// cc: converted
	// app.param ('document', controller.getObject);
	//app.param ('documentId', controller.getId);

};

