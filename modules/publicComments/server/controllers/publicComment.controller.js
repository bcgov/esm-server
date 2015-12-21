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

var saveComment = function (comment, req) {
	return new Promise (function (resolve, reject) {
		comment.dateUpdated  = Date.now();
		comment.updatedBy    = (req.user) ? req.user._id : null;
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
		if (!comment) return resolve ({});
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
		.catch (reject);
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
var saveDecorateReturn = function (comment, req, res) {
	saveComment (comment, req)
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
// a record in reverse chron order
//
// -------------------------------------------------------------------------
var queryModel = function (query) {
	return new Promise (function (resolve, reject) {
		Model.findOne (query).sort ({dateAdded:-1}).exec().then(resolve,reject);
	});
};
// -------------------------------------------------------------------------
//
// all queries in reverse chron order
//
// -------------------------------------------------------------------------
var queryModels = function (query, limit) {
	limit = limit || 0;
	return new Promise (function (resolve, reject) {
		Model.find (query).sort ({dateAdded:-1}).limit (limit).exec().then(resolve,reject);
	});
};
// -------------------------------------------------------------------------
//
// all queries in reverse chron order
//
// -------------------------------------------------------------------------
var queryModelsDecorate = function (query, limit) {
	return new Promise (function (resolve, reject) {
		queryModels (query, limit)
		.then (function (models) {
			var parray = models.map (function (model) {
				return decorateComment (model);
			});
			Promise.all (parray).then (resolve, reject);
		})
		.catch (reject);
	});
};

// -------------------------------------------------------------------------
//
// get all comments for a project by status in descending date order
//
// -------------------------------------------------------------------------
var getByProjectByStatus = function (projectId, status, limit) {
	var query = {
		project       : projectId,
		overallStatus : status
	};
	return queryModelsDecorate (query, limit);
	// return new Promise (function (resolve, reject) {
	// 	queryModels (query, limit)
	// 	.then (function (models) {
	// 		var parray = models.map (function (model) {
	// 			return decorateComment (model);
	// 		});
	// 		Promise.all (parray).then (resolve, reject);
	// 	})
	// 	.catch (reject);
	// });
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
	saveDecorateReturn (req.PublicComment, req, res);
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
	saveDecorateReturn (req.PublicComment, req, res);
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
	saveDecorateReturn (req.PublicComment, req, res);
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
	numberOfDeferredDocuments (req.PublicComment)
	.then (function (n) {
		if (n > 0) req.PublicComment.overallStatus = 'Deferred';
		return saveComment (req.PublicComment, req);
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
// reject the comment, defer all unvetted docs, set overall status to rejected
//
// -------------------------------------------------------------------------
var eaospam = function (req, res) {
	req.PublicComment.eaoStatus     = 'Spam';
	req.PublicComment.overallStatus = 'Spam';
	saveDecorateReturn (req.PublicComment, req, res);
};
exports.eaospam = eaospam;
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
	saveComment (original, req)
	.then (function () {
		return saveComment (req.PublicComment, req);
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
// helpers for claiming
//
// -------------------------------------------------------------------------
var getInProgressForUser = function (userid, query) {
	query = query || {};
	query = _.extend ({
		updatedBy : userid,
		overallStatus:'In Progress'
	}, query);
	return queryModelsDecorate (query);
};
// -------------------------------------------------------------------------
//
// when starting vetting get the list of all in progress comments for this
// user, also add one new unvetted one
//
// -------------------------------------------------------------------------
var vettingStart = function (req, res) {
	var userid = (req.user) ? req.user._id : null;
	getInProgressForUser (userid, {
		project : req.params.projectid
	})
	.then (function (models) {
		helpers.sendData (res, models);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.vettingStart = vettingStart;
// -------------------------------------------------------------------------
//
// get one new record to process, change its status to in progress
//
// -------------------------------------------------------------------------
var vettingClaim = function (req, res) {
	queryModel ({
		overallStatus:'Unvetted',
		eaoStatus : 'Unvetted',
		project : req.params.projectid
	})
	.then (function (model) {
		if (model) {
			model.overallStatus = 'In Progress';
			return saveComment (model, req);
		} else {
			return helpers.sendData (res, {});
		}
	})
	.then (decorateComment)
	.then (function (model) {
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.vettingClaim = vettingClaim;
// -------------------------------------------------------------------------
//
// same as above but for classifying
//
// -------------------------------------------------------------------------
var classifyStart = function (req, res) {
	var userid = (req.user) ? req.user._id : null;
	getInProgressForUser (userid, {
		overallStatus   : 'Published',
		proponentStatus : 'Deferred',
		project : req.params.projectid
	})
	.then (function (models) {
		helpers.sendData (res, models);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.classifyStart = classifyStart;
// -------------------------------------------------------------------------
//
// same as vetting claim, but for the proponent. select where published
// and unclassified
//
// -------------------------------------------------------------------------
var classifyClaim = function (req, res) {
	queryModel ({
		overallStatus:'Published',
		proponentStatus : 'Unclassified',
		project : req.params.projectid
	})
	.then (function (model) {
		model.overallStatus = 'In Progress';
		return saveComment (model, req);
	})
	.then (decorateComment)
	.then (function (model) {
		helpers.sendData (res, model);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};
exports.classifyClaim = classifyClaim;
// -------------------------------------------------------------------------
//
// propoenent deferes the comment
//
// -------------------------------------------------------------------------
var proponentdefer = function (req, res) {
	req.PublicComment.proponentStatus = 'Deferred';
	saveDecorateReturn (req.PublicComment, req, res);
};
exports.proponentdefer = proponentdefer;
// -------------------------------------------------------------------------
//
// propoenent classifies the comment
//
// -------------------------------------------------------------------------
var proponentclassify = function (req, res) {
	req.PublicComment.proponentStatus = 'Classified';
	saveDecorateReturn (req.PublicComment, req, res);
};
exports.proponentclassify = proponentclassify;
// -------------------------------------------------------------------------
//
// count the number of unvetted, unclaimed comments
//
// -------------------------------------------------------------------------
exports.unvetted = function (req, res) {
	Model.count ({
		overallStatus : 'Unvetted',
		eaoStatus     : 'Unvetted',
	}, function (err, n) {
		if (err) return helpers.sendError (res, err);
		return helpers.sendData (res, {count: n});
	});
};



