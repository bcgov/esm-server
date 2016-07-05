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
	// get put new delete
	//
	routes.setCRUDRoutes (app, 'document', DocumentClass, policy, ['get','put','new', 'delete'], {all:'guest',get:'guest'});
	// Import via CSV
	app.route ('/api/documents/import')
		.all (policy ('guest'))
		.post ( routes.setAndRun (DocumentClass, function (model, request) {
				return model.loadDocuments(request.files.file, request);
			}));
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
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getDocumentsForProject (req.params.projectid, req.headers.reviewdocsonly);
		}));
	//
	// getProjectDocumentTypes         : '/api/documents/types/' + projectId
	//
	app.route ('/api/documents/types/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getDocumentTypesForProject (req.params.projectid, req.headers.reviewdocsonly);
		}));
	//
	// getProjectDocumentSubTypes      : '/api/documents/subtypes/' + projectId
	//
	app.route ('/api/documents/subtypes/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getDocumentSubTypesForProject (req.params.projectid);
		}));
	//
	// getProjectDocumentFolderNames   : '/api/documents/folderNames/' + projectId
	//
	app.route ('/api/documents/folderNames/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getDocumentFolderNamesForProject (req.params.projectid);
		}));
	//
	// getProjectDocumentFolderNames (for MEM)   : '/api/documents/memtypes/' + projectId
	//
	app.route ('/api/documents/memtypes/:projectid')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getDocumentTypesForProjectMEM (req.params.projectid);
		}));
	//
	// getProjectDocumentVersions      : '/api/documents/versions/' + projectId
	//
	app.route ('/api/documents/versions/:document')
		.all (policy ('guest'))
		.get (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getDocumentVersions (req.Document);
		}));
	//
	// getDocumentsInList              : '/api/documentlist', data:documentList
	//
	app.route ('/api/documentlist')
		.all (policy ('guest'))
		.put (routes.setAndRun (DocumentClass, function (model, req) {
			return model.getList (req.body);
		}));
	//
	// fetch a document (download multipart stream)
	//
	app.route ('/api/document/:document/fetch')
		.all (policy ('guest'))
		.get (function (req, res) {
			if (req.Document.internalURL.match (/^(http|ftp)/)) {
				res.redirect (req.Document.internalURL);
			} else {
				routes.streamFile (res, {
					file : req.Document.internalURL,
					name : req.Document.internalOriginalName,
					mime : req.Document.internalMime
				});
			}
		});
	//
	// upload document
	//
	app.route ('/api/document/:project/upload').all (policy ('guest'))
		.post (routes.setAndRun (DocumentClass, function (model, req) {
			return new Promise (function (resolve, reject) {
				var file = req.files.file;
				if (file) {
					var opts = { oldPath: file.path, projectCode: req.Project.code};
					routes.moveFile (opts)
					.then (function (newFilePath) {
						return model.create ({
							// Metadata related to this specific document that has been uploaded.
							// See the document.model.js for descriptions of the parameters to supply.
							project                 : req.Project,
							//projectID             : req.Project._id,
							projectFolderType       : req.headers.documenttype,//req.headers.projectfoldertype,
							projectFolderSubType    : req.headers.documentsubtype,//req.headers.projectfoldersubtype,
							projectFolderName       : req.headers.documentfoldername,
							projectFolderURL        : newFilePath,//req.headers.projectfolderurl,
							projectFolderDatePosted : Date.now(),//req.headers.projectfolderdateposted,
							// NB                   : In EPIC, projectFolders have authors, not the actual documents.
							projectFolderAuthor     : req.headers.projectfolderauthor,
							// These are the data as it was shown on the EPIC website.
							documentAuthor          : req.headers.documentauthor,
							documentFileName        : req.headers.documentfilename,
							documentFileURL         : req.headers.documentfileurl,
							documentFileSize        : req.headers.documentfilesize,
							documentFileFormat      : req.headers.documentfileformat,
							documentIsInReview      : req.headers.documentisinreview,
							documentVersion         : 0,
							// These are automatic as it actually is when it comes into our system
							internalURL             : newFilePath,
							internalOriginalName    : file.originalname,
							internalName            : file.name,
							internalMime            : file.mimetype,
							internalExt             : file.extension,
							internalSize            : file.size,
							internalEncoding        : file.encoding
						});
					})
					.then (resolve, reject);
				}
				else {
					reject ("no file to upload");
				}
			});
		}));
};

