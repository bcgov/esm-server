'use strict';
// =========================================================================
//
// Controller for document
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Model    = mongoose.model ('Document');
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var Project = mongoose.model ('Project');
//var Spooky 	= require('spooky');
//var Cheerio = require('cheerio');

var crud = new CRUD (Model);
// -------------------------------------------------------------------------
//
// Basic CRUD
//
// -------------------------------------------------------------------------
exports.new    = crud.new    ();
exports.create = crud.create ();
exports.read   = crud.read   ();
exports.update = crud.update ();
exports.delete = crud.delete ();
exports.list   = crud.list   ();
exports.getObject   = crud.getObject();

// -------------------------------------------------------------------------
//
// import a document observation, set any special audit fields here
//
// -------------------------------------------------------------------------
var importDocument = function (doc, req) {
	return new Promise (function (resolve, reject) {
		// TODO: Check for versioning of this file.  Address as nescessary.
		// ? - This will compare projectFolderType, projectFolderSubType, projectFolderName, and documentFileName.
		// ? - If these are all = to each other, then this is very likely a new version.
		Model.findOne({
			documentIsLatestVersion: true,
			projectFolderType   	: doc.projectFolderType,
			projectFolderSubType	: doc.projectFolderSubType,
			projectFolderName  		: doc.projectFolderName,
			documentFileName 		: doc.documentFileName
		}, function (err, mo) {
			if (err) {
				console.log("document.controller: Error in Query.");
			} else {
				//console.log("Query found: " + mo);
				if (null === mo) {
					// Don't do anything
					//console.log("No existing documents found.  Inserting normally.");
				} else {
					// Bump version, this is new!
					//console.log("Found existing document.  Making old version !latest.");
					doc.documentVersion = mo.documentVersion + 1;
					doc.save();
					mo.documentIsLatestVersion = false;
					mo.save();
				}
			}
		});
		doc.dateUpdated  = Date.now ();
		doc.updatedBy    = (req.user) ? req.user._id : null;
		doc.save ().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// import a document, return it via service
//
// -------------------------------------------------------------------------
var importDocumentAndReturn = function (doc, req, res) {
	importDocument (doc, req)
	.then (function (model) {
		//console.log (model);
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		// console.log (err);
		helpers.sendError (res, err);
	});
};
/*
//
// scrapeAndSearch Documents for links, and pull them into the system.
//
// -------------------------------------------------------------------------
var scrapeAndSearch = function (req, res) {
	// gather the document urls, the structure and any meta data around them,
	// their proper names, and the scraper should start at a project
	// level and then go deep into all documents. It would likely create a
	// file that would be consumed by part two. This could then be edited to
	// remove anything that we don't want pulled down.
	return new Promise (function (resolve, reject) {
		console.log("scrapeAndSearch.run for ProjectID: " + req.Project._id);
		var url = req.headers.url;
		console.log("URL: " + url);

		var spooky = new Spooky({
			child: {
				transport: 'http'
			},
			casper: {
				logLevel: 'debug',
				verbose: true
			}
		}, function (err) {
			if (err) {
				var e = new Error('Failed to initialize SpookyJS');
				e.details = err;
				throw e;
			}
			console.log("Spooky getting: " + url);
			spooky.start(url);
			spooky.then(function () {
				this.emit('pageContent', this.getHTML('html', true));
			});
			spooky.run();
		});

		spooky.on('error', function (e, stack) {
			console.error(e);
			if (stack) {
				console.log(stack);
			}
		});

		spooky.on('pageContent', function (content) {
			//console.log('Parsing page content:' + content);
			//var jsdom = require('jsdom');
			var cheerio = require('cheerio');
			console.log("");
			var $ = cheerio.load(content);
			$('table.docs tbody tr td a').each(function(i, element) {
				var a = $(this);
				//console.log(a.text());
				//var projectFolderType = a.text(); // TODO: go up to nearest TD head1 = Folder Type
				//var projectFolderSubType = a.text(); // TODO: go up to nearest TD head2 = Folder SubType
				var projectFolderName = a.text();
				var projectFolderURL = a.attr('href');
				//console.log("+++")
				//console.log("projectFolderType: " + projectFolderType);
				//console.log("projectFolderSubType: " + projectFolderSubType);
				console.log("projectFolderName: " + projectFolderName);
				console.log("projectFolderURL: " + projectFolderURL);
				//console.log("---")
			});
			console.log("----");
			res.json("ok");
		   });

		// We should be fed url's like the following:
		// https://a100.gov.bc.ca/appsdata/epic/html/deploy/epic_project_doc_index_362.html
		// Search for Folder Types as defined in document.model.js:
		// r= Under Review
		// p= Pre-Application
		// w= Withdrawn
		// t= Terminated
		// a= Certificate Issued
		// k= Amendments

		//res.json("ok");
	});
};
exports.scrapeAndSearch = scrapeAndSearch;
*/
//
// upload document - include all relevant information about the document.
//
// -------------------------------------------------------------------------
var upload = function (req, res) {
	//console.log ('++uploading file:');
	//console.log (req.files);
	//console.log ('end of file');
	var file = req.files.file;
	if (file) {
		//console.log (file);
		//console.log('++headers');
		//console.log(req.headers);
		//console.log('--headers');
		importDocumentAndReturn (new Model ({
			// Metadata related to this specific document that has been uploaded.
			// See the document.model.js for descriptions of the parameters to supply.
			project 												: req.Project._id,
			projectFolderType								: req.headers.projectfoldertype,
			projectFolderSubType					  : req.headers.projectfoldersubtype,
			projectFolderName 							: req.headers.projectfoldername,
			projectFolderURL 								: req.headers.projectfolderurl,
			projectFolderDatePosted 				: req.headers.projectfolderdateposted,
			// These are the data as it was shown on the EPIC website.
			documentFileName 								: req.headers.documentfilename,
			documentFileURL 								: req.headers.documentfileurl,
			documentFileSize 								: req.headers.documentfilesize,
			documentFileFormat 							: req.headers.documentfileformat,
			// These are automatic as it actually is when it comes into our system
			internalURL						: file.path,
			internalOriginalName  : file.originalname,
			internalName  				: file.name,
			internalMime      		: file.mimetype,
			internalExt       		: file.extension,
			internalSize      		: file.size,
			internalEncoding  		: file.encoding
		}), req, res);
	} else {
		helpers.sendErrorMessage (res, "document.controller.upload: No file found to upload");
	}
};
exports.upload = upload;
