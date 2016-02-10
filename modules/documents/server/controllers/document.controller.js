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
var Spooky 	= require('spooky');
var Cheerio = require('cheerio');

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

//
// -------------------------------------------------------------------------
//
// getDocumentsForProject
//
// -------------------------------------------------------------------------
var getDocumentsForProject = function (doc, req) {
	return new Promise (function (resolve, reject) {
		console.log("getDocumentsForProject: Project ID:",req.ProjectID);
	});
};
// -------------------------------------------------------------------------
//
// import a document, return it via service
//
// -------------------------------------------------------------------------
var getDocumentsForProjectAndReturn = function (doc, req, res) {
	getDocumentsForProject (doc, req)
	.then (function (model) {
		//console.log (model);
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		// console.log (err);
		helpers.sendError (res, err);
	});
};
exports.getDocumentsForProjectAndReturn = getDocumentsForProjectAndReturn;


//
// -------------------------------------------------------------------------
//
// getDocumentTypesForProject
//
// -------------------------------------------------------------------------
var getDocumentTypesForProject = function (doc, req) {
	return new Promise (function (resolve, reject) {
		console.log("getDocumentTypesForProject: Project ID:");
	});
};
// -------------------------------------------------------------------------
//
// import a document, return it via service
//
// -------------------------------------------------------------------------
var getDocumentTypesForProjectAndReturn = function (doc, req, res) {
	getDocumentTypesForProject (doc, req)
	.then (function (model) {
		//console.log (model);
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		// console.log (err);
		helpers.sendError (res, err);
	});
};
exports.getDocumentTypesForProjectAndReturn = getDocumentTypesForProjectAndReturn;

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
// -------------------------------------------------------------------------
//
// saveReviewableDocumentObject - insert this document we found, flag for review.
//
// -------------------------------------------------------------------------
var saveReviewableDocumentObject = function (docobj) {
	return new Promise (function (resolve, reject) {
		docobj.save ().then (resolve, reject);
	});
};
var insertReviewableDocument = function (jobid, type, subtype, name, url, author, date) {
	saveReviewableDocumentObject( new Model ({	projectFolderType   	: type,
												projectFolderSubType	: subtype,
												projectFolderName  		: name,
												projectFolderURL 		: url,
												projectFolderAuthor		: author,
												projectFolderDatePosted : date,
												documentIsInReview		: true
												}));
};


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
		//console.log("scrapeAndSearch.run for ProjectID: " + req.Project._id);
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
			// TODO: Generate a unique ID to track this request as done
			var jobID = 1;
			var cheerio = require('cheerio');
			var $ = cheerio.load(content);
			var top = $('table.docs');
			// Get a collection of the <tr> elements
			var elem = top.children().first().children();
			var projectFolderType = "";
			var projectFolderSubType = "";

			// Loop through each child
			top.children().first().children().each(function (i, elem) {
				var className = $(this).first().children().first().attr('class');
				if ('head1' === className) {
					//console.log("detected:" + className);
					projectFolderType = $(this).first().children().first().text();
				} else if ('head2' === className) {
					//console.log("detected:" + className);
					projectFolderSubType = $(this).first().children().first().text();
				} else if ('head3' === className) {
					// Ignore
				} else {
					// We found a good <td> element
					var projectFolderName = $(this).children().first().text();
					var projectFolderURL  = $(this).children().first().children().first().attr('href');
					var author            = $(this).children().first().next().text().trim();
					var postedDate        = $(this).children().first().next().next().text();
					// If projectFolderURL undefined then we're probably on the last element.  Bail.
					if (undefined !== projectFolderURL) {
					// We found a document, add it to the system for review.
						// console.log("projectFolderType: "    + projectFolderType);
						// console.log("projectFolderSubType: " + projectFolderSubType);
						// console.log("projectFolderName: "    + projectFolderName);
						// console.log("projectFolderURL: "     + projectFolderURL);
						// console.log("author: "               + author);
						// console.log("postedDate: "           + postedDate);
						// console.log("----------");
						insertReviewableDocument(	jobID,
													projectFolderType,
													projectFolderSubType,
													projectFolderName,
													projectFolderURL,
													author,
													postedDate);
					}
				}
			});
			res.json("request submitted, jobID=" + jobID);
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
//
// populateReviewDocuments - Go through each reviewable document list, grabbing each Document
// File and inserting a full record for it.
//
// -------------------------------------------------------------------------
var populateReviewDocuments = function (req, res) {
	return new Promise (function (resolve, reject) {
		//console.log("populateReviewDocuments.run for ProjectID: " + req.Project._id);
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
			// TODO: Generate a unique ID to track this request as done
			var cheerio = require('cheerio');
			var $ = cheerio.load(content);

			// Get Type+SubType
			var TST = $('div.epic_prjDetail h1');
			var TSTArray = TST.text().trim().split(">>");

			var top = $('table.docs');
			var projectFolderType = TSTArray[0].trim();
			var projectFolderSubType = TSTArray[1].trim();
			console.log(projectFolderType);
			console.log(projectFolderSubType);
			var projectFolderName = "";
			var projectFolderDatePosted = "";
			// Get a collection of the <tr> elements
			top.each(function (i, elem) {
				if (0 === i) {
					// This is where we get the projectFolderName/DatePosted
					$(this).children().first().children().first().children().each(function (z, el) {
						//console.log("THIS: " + $(this).text());
						if (z === 0) return true; // Skip the first.
						if (z === 1) projectFolderName = $(this).text();
						if (z === 3) projectFolderDatePosted = $(this).text();
					});
				} else if (1 === i) {
					// Skip the first .docs class, the second one is the one we
					// really want.
					//console.log("got the 2nd .docs");
					$(this).children().first().children().each(function (z, el) {
						// Get each TR
						if (0 === z) return true; // skip the first
						if ("" === $(this).text()) return true; // skip the last
						//console.log("Currently at: " + $(this).text());

						var tr = $(this).children();
						var documentFileURL		= $(tr).first().children().first().attr('href');
						var documentFileName	= $(tr).first().children().first().text();
						var documentSize		= $(tr).first().next().text().trim();
						var documentType		= $(tr).first().next().next().text();

						console.log("..........");
						console.log("projectFolderType:"		+ projectFolderType);
						console.log("projectFolderSubType:"		+ projectFolderSubType);
						console.log("projectFolderName:"		+ projectFolderName);
						console.log("projectFolderDatePosted:"	+ projectFolderDatePosted);
						console.log("documentFile:"				+ documentFileURL);
						console.log("documentFileName:"			+ documentFileName);
						console.log("documentSize:"				+ documentSize);
						console.log("documentType:"				+ documentType);
						// TODO:We are now ready to insert but still flag for review
					});
				}
			});
			res.json("OK");
		   });
	});
};
exports.populateReviewDocuments = populateReviewDocuments;

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
			project 					: req.Project._id,
			projectFolderType			: req.headers.projectfoldertype,
			projectfoldersubtype		: req.headers.projectfoldersubtype,
			projectFolderName			: req.headers.projectfoldername,
			projectFolderURL			: req.headers.projectfolderurl,
			projectFolderDatePosted		: req.headers.projectfolderdateposted,
			// These are the data as it was shown on the EPIC website.
			documentFileName	: req.headers.documentfilename,
			documentFileURL		: req.headers.documentfileurl,
			documentFileSize	: req.headers.documentfilesize,
			documentFileFormat	: req.headers.documentfileformat,
			// These are automatic as it actually is when it comes into our system
			internalURL				: file.path,
			internalOriginalName	: file.originalname,
			internalName			: file.name,
			internalMime			: file.mimetype,
			internalExt				: file.extension,
			internalSize			: file.size,
			internalEncoding		: file.encoding
		}), req, res);
	} else {
		helpers.sendErrorMessage (res, "document.controller.upload: No file found to upload");
	}
};
exports.upload = upload;
