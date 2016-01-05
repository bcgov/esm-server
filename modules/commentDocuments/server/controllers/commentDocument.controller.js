'use strict';
// =========================================================================
//
// Controller for commentDocuments
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Model    = mongoose.model ('CommentDocument');
var helpers         = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var PublicComment = mongoose.model ('PublicComment');

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
exports.getObject   = crud.getObject   ();

// -------------------------------------------------------------------------
//
// save a document observation, set any special audit fields here
//
// -------------------------------------------------------------------------
var saveDocument = function (doc, req) {
	return new Promise (function (resolve, reject) {
		doc.dateUpdated  = Date.now ();
		doc.updatedBy    = (req.user) ? req.user._id : null;
		doc.save ().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// save a document, return it via service
//
// -------------------------------------------------------------------------
var saveAndReturn = function (doc, req, res) {
	saveDocument (doc, req)
	.then (function (model) {
		// console.log (model);
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		// console.log (err);
		helpers.sendError (res, err);
	});
};

// -------------------------------------------------------------------------
//
// defer the document
//
// -------------------------------------------------------------------------
var eaodefer = function (req, res) {
	req.CommentDocument.eaoStatus = 'Deferred';
	saveAndReturn (req.CommentDocument, req, res);
};
exports.eaodefer = eaodefer;
// -------------------------------------------------------------------------
//
// accept the document
//
// -------------------------------------------------------------------------
var eaoaccept = function (req, res) {
	req.CommentDocument.eaoStatus = 'Accepted';
	saveAndReturn (req.CommentDocument, req, res);
};
exports.eaoaccept = eaoaccept;
// -------------------------------------------------------------------------
//
// reject the document
//
// -------------------------------------------------------------------------
var eaoreject = function (req, res) {
	req.CommentDocument.eaoStatus = 'Rejected';
	saveAndReturn (req.CommentDocument, req, res);
};
exports.eaoreject = eaoreject;
// -------------------------------------------------------------------------
//
// publish document
//
// -------------------------------------------------------------------------
var eaopublish = function (req, res) {
	req.CommentDocument.eaoStatus = 'Published';
	saveAndReturn (req.CommentDocument, req, res);
};
exports.eaopublish = eaopublish;
// -------------------------------------------------------------------------
//
// notate document
//
// -------------------------------------------------------------------------
var notate = function (req, res) {
	req.CommentDocument.eaoNotes       = req.body.eaoNotes;
	req.CommentDocument.proponentNotes = req.body.proponentNotes;
	saveAndReturn (req.CommentDocument, req, res);
};
exports.notate = notate;
// -------------------------------------------------------------------------
//
// upload document
//
// -------------------------------------------------------------------------
var upload = function (req, res) {
	// console.log ('++uploading file:');
	// console.log (req.files);
	// console.log ('end of file');
	var file = req.files.file;
	if (file) {
		// console.log (file);
		saveAndReturn (new Model ({
			// project       : req.PublicComment.project || null,
			publicComment : req.params.publiccommentid,
			url           : file.path,
			name          : file.originalname,
			internalName  : file.name,
			mime          : file.mimetype,
			ext           : file.extention,
			size          : file.size,
			encoding      : file.encoding
		}), req, res);
	} else {
		helpers.sendErrorMessage (res, "No file found to upload");
	}
};
exports.upload = upload;
// -------------------------------------------------------------------------
//
// fetch a document from the server wherever it may live
//
// -------------------------------------------------------------------------
var fetchd = function (req, res) {
	//
	// if the url starts with http or ftp then we redirect
	//
	if (req.CommentDocument.url.match (/^(http|ftp)/)) {
		res.redirect (req.CommentDocument.url);
	} else {
		helpers.streamFile (res, req.CommentDocument.url, req.CommentDocument.name, req.CommentDocument.mime);
	}
};
exports.fetchd = fetchd;

