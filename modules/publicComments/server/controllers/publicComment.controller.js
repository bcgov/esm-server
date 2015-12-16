'use strict';
// =========================================================================
//
// Controller for publicComments
//
// =========================================================================
var path            = require ('path');
var mongoose        = require ('mongoose');
var CRUD            = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Model           = mongoose.model ('PublicComment');
var CommentDocument = mongoose.model ('CommentDocument');
var helpers         = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var _               = require ('lodash');


var crud = new CRUD (Model);

// -------------------------------------------------------------------------
//
// look at all documents under the comment, if any are deferred then set
// overall status to deferred. if comment is deferred then overall is defe
//
// -------------------------------------------------------------------------
var overallStatus = function (currentStatus, documents) {
	switch (currentStatus) {
		case 'Unvetted':
		case 'Rejected':
		case 'Deferred':
		case 'Accepted':
			break;
		case 'Published':
			_.each (documents, function (doc) {
				if (doc.eaoStatus === 'Deferred') currentStatus = 'Deferred';
			});
	}
	return currentStatus;
};
exports.overallStatus = overallStatus;

var saveComment = function (comment) {
	return new Promise (function (resolve, reject) {
		comment.save ().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// get all docs attached to a comment
//
// -------------------------------------------------------------------------
var getDocumentsForComment = function (commentId) {
	return new Promise (function (resolve, reject) {
		CommentDocument.find ({publicComment:commentId}, function (err, model) {
			if (err) return reject (err);
			resolve (model);
		});
	});
};

// -------------------------------------------------------------------------
//
// get all issues for a comment
//
// -------------------------------------------------------------------------
var getIssuesForComment = function (commentId) {
	return new Promise (function (resolve, reject) {
		resolve ([]);
	});
};

// -------------------------------------------------------------------------
//
// get all buckets for a comment
//
// -------------------------------------------------------------------------
var getBucketsForComment = function (commentId) {
	return new Promise (function (resolve, reject) {
		resolve ([]);
	});
};

// -------------------------------------------------------------------------
//
// given a comment, add its children
//
// -------------------------------------------------------------------------
var decorateComment = function (comment) {
	return new Promise (function (resolve, reject) {
		comment = comment.toObject ();
		getDocumentsForComment (comment._id)
		.then (function (a) {
			comment.documents = a;
			return getBucketsForComment (comment._id);
		})
		.then (function (a) {
			comment.buckets = a;
			return getIssuesForComment (comment._id);
		})
		.then (function (a) {
			comment.issues = a;
			resolve (comment);
		})
		.catch (function (err) {
			reject (err);
		});
	});
};

// -------------------------------------------------------------------------
//
// get a fully filled out comment with docs, issues, buckets
//
// -------------------------------------------------------------------------
var getFullComment = function (commentId) {
	return new Promise (function (resolve, reject) {
		Model.findById(commentId).exec(function (err, model) {
			if (err) return reject (err);
			decorateComment (model).then (resolve, reject);
		});
	});
};

// -------------------------------------------------------------------------
//
// save a comment, decorate it, return it via service
//
// -------------------------------------------------------------------------
var saveDecorateReturn = function (comment, res) {
	saveComment (comment)
	.then (function (model) {
		return decorateComment (model);
	})
	.then (function (model) {
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};

// -------------------------------------------------------------------------
//
// count the number of deferred documents under this comment
//
// -------------------------------------------------------------------------
var numberOfDeferredDocuments = function (comment) {
	return new Promise (function (resolve, reject) {
		CommentDocument.find ({publicComment:comment._id, eaoStatus:'Deferred'}, function (err, models) {
			if (err) return reject (err);
			resolve (models.length);
		});
	});
};

// -------------------------------------------------------------------------
//
// get all comments for a project by status in descending date order
//
// -------------------------------------------------------------------------
var getByProjectByStatus = function (projectId, status, limit) {
	return new Promise (function (resolve, reject) {
		limit = limit || 0;
		Model.find ({
			project       : projectId,
			overallStatus : status
		})
		.sort ({dateAdded:-1})
		.limit (limit)
		.exec (function (err, models) {
			if (models) {
				var parray = models.map (function (model) {
					return decorateComment (model);
				});
				Promise.all (parray).then (resolve, reject);
			} else {
				resolve ([]);
			}
		});
	});
};


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
exports.getObject = crud.getObject ();
// exports.getObject = function (req, res, next, id) {
// 	getFullComment (id)
// 	.then (function (model) {
// 		req.PublicComment = model;
// 		next ();
// 	})
// 	.catch (function (err) {
// 		return next (err);
// 	});
// };

// -------------------------------------------------------------------------
//
// get all published comments
//
// -------------------------------------------------------------------------
var allPublished = function (req, res) {
	var limit = req.params.limit || 0;
	getByProjectByStatus (req.params.projectid, 'Published', limit)
	.then (function (models) {
		helpers.sendData (res, models);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.allPublished = allPublished;
// -------------------------------------------------------------------------
//
// get all unpublished comments, perhaps within a limit and offset
//
// -------------------------------------------------------------------------
var allUnPublished = function (req, res) {
	var limit = req.params.limit || 0;
	getByProjectByStatus (req.params.projectid, {$ne:'Published'}, limit)
	.then (function (models) {
		helpers.sendData (res, models);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.allUnPublished = allUnPublished;
var fillPublicComment = function () {};
// -------------------------------------------------------------------------
//
// defer the comment, also defer all documents that are unvetted
// set overall status
//
// -------------------------------------------------------------------------
var eaodefer = function (req, res) {
	req.PublicComment.eaoStatus     = 'Deferred';
	req.PublicComment.overallStatus = 'Deferred';
	req.PublicComment.updatedBy     = (req.user) ? req.user._id : null;
	saveDecorateReturn (req.PublicComment, res);
};
exports.eaodefer = eaodefer;
// -------------------------------------------------------------------------
//
// accept the comment, defer all unvetted documents
// set overall status
//
// -------------------------------------------------------------------------
var eaoaccept = function (req, res) {
	req.PublicComment.eaoStatus     = 'Accepted';
	req.PublicComment.overallStatus = 'Accepted';
	req.PublicComment.updatedBy     = (req.user) ? req.user._id : null;
	saveDecorateReturn (req.PublicComment, res);
};
exports.eaoaccept = eaoaccept;
// -------------------------------------------------------------------------
//
// reject the comment, defer all unvetted docs, set overall status to rejected
//
// -------------------------------------------------------------------------
var eaoreject = function (req, res) {
	req.PublicComment.eaoStatus     = 'Rejected';
	req.PublicComment.overallStatus = 'Rejected';
	req.PublicComment.updatedBy     = (req.user) ? req.user._id : null;
	saveDecorateReturn (req.PublicComment, res);
};
exports.eaoreject = eaoreject;
// -------------------------------------------------------------------------
//
// publish, set unvetted docs to deferred, set overall status
//
// -------------------------------------------------------------------------
var eaopublish = function (req, res) {
	req.PublicComment.eaoStatus     = 'Published';
	req.PublicComment.overallStatus = 'Published';
	req.PublicComment.updatedBy     = (req.user) ? req.user._id : null;
	numberOfDeferredDocuments (req.PublicComment)
	.then (function (n) {
		if (n > 0) req.PublicComment.overallStatus = 'Deferred';
		return saveComment (req.PublicComment);
	})
	.then (function (model) {
		return decorateComment (model);
	})
	.then (function (model) {
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.eaopublish = eaopublish;
// -------------------------------------------------------------------------
//
// edit the document
//
// -------------------------------------------------------------------------
var eaoedit = function (req, res) {
	var copy                   = req.PublicComment.toObject ();
	delete copy._id;
	copy.overallStatus         = 'Rejected';
	copy.eaoStatus             = 'Rejected';
	copy.proponentStatus       = 'Unclassified';
	var original               = new Model (copy);
	req.PublicComment.original = original._id;
	req.PublicComment.comment  = req.body.comment;
	saveComment (original)
	.then (function () {
		return saveComment (req.PublicComment);
	})
	.then (function (model) {
		return decorateComment (model);
	})
	.then (function (model) {
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.eaoedit = eaoedit;
// -------------------------------------------------------------------------
//
// edit the document
//
// -------------------------------------------------------------------------
var proponentdefer = function (req, res) {
	req.PublicComment.proponentStatus = 'Deferred';
	req.PublicComment.updatedBy       = (req.user) ? req.user._id : null;
	saveDecorateReturn (req.PublicComment, res);
};
exports.proponentdefer = proponentdefer;
// -------------------------------------------------------------------------
//
// edit the document
//
// -------------------------------------------------------------------------
var proponentclassify = function (req, res) {
	req.PublicComment.proponentStatus = 'Classified';
	req.PublicComment.updatedBy       = (req.user) ? req.user._id : null;
	saveDecorateReturn (req.PublicComment, res);
};
exports.proponentclassify = proponentclassify;



