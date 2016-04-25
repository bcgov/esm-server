'use strict';

var mongoose        = require('mongoose'),
	_               = require('lodash'),
	PublicComment   = mongoose.model('PublicComment'),
	CommentDocument = mongoose.model('CommentDocument'),
	BucketComment   = mongoose.model('BucketComment'),
	P               = require('promise');

var comments = {};
var commentarray = [];

// -------------------------------------------------------------------------
//
// get a stored or retrieved document
//
// -------------------------------------------------------------------------
var getComment = function (id) {
	return new P (function (resolve, reject) {
		//
		// if we have it, return it
		//
		if (comments[id]) {
			return resolve (comments[id]);
		}
		//
		// otherwise go get it
		//
		else {
			PublicComment.findOne({_id:id}).exec()
			.then (function (pc) {
				//
				// first time in clear out the documents and buckets
				//
				pc.documents = [];
				pc.buckets = [];
				//
				// set up the array and the index and resolve
				//
				commentarray.push (pc);
				comments[pc._id] = pc;
				resolve (pc);
			});
		}
	});
};

// -------------------------------------------------------------------------
//
// save with whatever housekeeping required
//
// -------------------------------------------------------------------------
var saveComment = function (comment) {
	comment.markModified ('documents');
	comment.markModified ('buckets');
	return comment.save();
};
var saveComments = function () {
	return P.all (commentarray.map (function (comment) {
		return saveComment (comment);
	}));
};
// -------------------------------------------------------------------------
//
// get all documents (converts mongoose promise into a proper one)
//
// -------------------------------------------------------------------------
var getDocuments = function () {
	return new P (function (resolve, reject) {
		CommentDocument.find({}).exec().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// get all buckets (converts mongoose promise into a proper one)
//
// -------------------------------------------------------------------------
var getBuckets = function () {
	return new P (function (resolve, reject) {
		BucketComment.find({}).exec().then (resolve, reject);
	});
};

// -------------------------------------------------------------------------
//
// go through the list of documents and add them to the comments
//
// -------------------------------------------------------------------------
var replaceDocuments = function (documentModels) {
	return P.all (documentModels.map (function (documentModel) {
		var commentId  = documentModel.publicComment;
		var documentId = documentModel._id;
		// console.log ('adding document '+documentId+' to comment '+commentId);
		return getComment (commentId)
		.then (function (comment) {
			comment.documents.push (documentId);
		});
	}));
};

// -------------------------------------------------------------------------
//
// go through the list of buckets and add them to the comments
//
// -------------------------------------------------------------------------
var replaceBuckets = function (bucketModels) {
	return P.all (bucketModels.map (function (bucketModel) {
		var commentId = bucketModel.publicComment;
		var bucketId = bucketModel.bucket;
		// console.log ('adding bucket '+bucketId+' to comment '+commentId);
		return getComment (commentId)
		.then (function (pc) {
			pc.buckets.push (bucketId);
		});
	}));
};

// -------------------------------------------------------------------------
//
// main
//
// -------------------------------------------------------------------------
module.exports = function () {
	return new P (function (resolve, reject) {
		P.resolve ()
		.then (getDocuments)
		.then (replaceDocuments)
		.then (getBuckets)
		.then (replaceBuckets)
		.then (saveComments)
		.then (resolve, reject);
	});
};


