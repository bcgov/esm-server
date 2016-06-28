'use strict';
// =========================================================================
//
// Routes for Documents
//
// Does not use the normal crud routes, mostly special sauce
//
// =========================================================================
var DocumentClass  = require ('../controllers/cc.document.controller');
var routes = require ('../../../core/server/controllers/cc.routes.controller');
var policy = require ('../../../core/server/controllers/cc.policy.controller');

module.exports = function (app) {
	//
	// getAllDocuments
	//

	//
	// getAllDocuments                 : '/api/documents'
	//
	app.route ('/api/documents')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.list ();
		}));
	//
	// getProjectDocuments             : '/api/documents/' + projectId
	//
	app.route ('/api/documents/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model,req) {
			return model.getDocumentsForProject (req.params.projectid, req.headers.reviewdocsonly);
		}));
	//
	// getProjectDocumentTypes         : '/api/documents/types/' + projectId
	//
	app.route ('/api/documents/types/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model,req) {
			return model.getDocumentTypesForProject (req.params.projectid, req.headers.reviewdocsonly);
		}));
	//
	// getProjectDocumentSubTypes      : '/api/documents/subtypes/' + projectId
	//
	app.route ('/api/documents/subtypes/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model,req) {
			return model.getDocumentSubTypesForProject (req.params.projectid);
		}));
	// //
	// //getProjectDocumentFolderNames   : '/api/documents/folderNames/' + projectId
	// //
	// app.route ()
	// 	.all (policy ('guest'))
	// 	.get (routes.setAndRun (DocumentClass, function (model,req) {
	// 		return modelfunction ();
	// 	}));
	// //
	// //getProjectDocumentVersions      : '/api/documents/versions/' + projectId
	// //
	// app.route ()
	// 	.all (policy ('guest'))
	// 	.get (routes.setAndRun (DocumentClass, function (model,req) {
	// 		return modelfunction ();
	// 	}));
	// //
	// //downloadAndApprove              : '/api/documents/approveAndDownload/' + documentObj
	// //
	// app.route ()
	// 	.all (policy ('guest'))
	// 	.get (routes.setAndRun (DocumentClass, function (model,req) {
	// 		return modelfunction ();
	// 	}));
	// //
	// //deleteDocument                  : '/api/document/' + document
	// //
	// app.route ()
	// 	.all (policy ('guest'))
	// 	.get (routes.setAndRun (DocumentClass, function (model,req) {
	// 		return modelfunction ();
	// 	}));
	// //
	// //getDocumentsInList              : '/api/documentlist', data:documentList
	// //
	// app.route ()
	// 	.all (policy ('guest'))
	// 	.get (routes.setAndRun (DocumentClass, function (model,req) {
	// 		return modelfunction ();
	// 	}));


	// // Import via CSV
	// app.route ('/api/documents/import').all (policy ('guest'))
	// 	.post (controller.loadDocuments);

	// app.route ('/api/documents/:documentid/relate/:projectid/').all (policy ('guest'))
	// 	.post (controller.mapDocumentToProject);

	// app.route ('/api/documents/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentsForProjectAndReturn);

	// app.route ('/api/documents/types/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentTypesForProjectAndReturn);
	// app.route ('/api/documents/memtypes/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentTypesForProjectMEMAndReturn);

	// app.route ('/api/documents/subtypes/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentSubTypesForProjectAndReturn);

	// app.route ('/api/documents/folderNames/:projectid').all (policy ('guest'))
	// 	.get  (controller.getDocumentFolderNamesForProjectAndReturn);

	// app.route ('/api/documents/versions/:documentid').all (policy ('guest'))
	// 	.get  (controller.getDocumentVersionsAndReturn);

	// app.route ('/api/documents/approveAndDownload/:document').all (policy ('user'))
	// 	.put  (controller.approveAndDownload);
	// //
	// // model routes
	// //
	// app.route ('/api/document/:document').all (policy ('guest'))
	// 	.get    (controller.read)
	// 	.put    (controller.update)
	// 	.delete (controller.delete);

	// // Find a document Folder (scrapeAndSearch)
	// app.route ('/api/scrapeAndSearch').all (policy ('guest'))
	// 	.get (controller.scrapeAndSearch);

	// // Find a specific document (populateReviewDocuments)
	// app.route ('/api/populateReviewDocuments').all (policy ('guest'))
	// 	.get (controller.populateReviewDocuments);

	// //
	// // upload a document
	// //
	// app.route ('/api/document/:project/upload').all (policy ('guest'))
	// 	.post (controller.upload);

	// // Fetch doc
	// app.route ('/api/document/:document/fetch').all (policy ('guest'))
	// 	.get (controller.fetchd);

	// app.route ('/api/documentlist').all (policy ('guest'))
	// 	.put (controller.getlist);
	// //
	// // middleware to auto-fetch parameter
	// //
	// app.param ('document', controller.getObject);
	// //app.param ('documentId', controller.getId);

};

