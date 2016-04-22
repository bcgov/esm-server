'use strict';

var mongoose        = require('mongoose'),
	_               = require('lodash'),
	PublicComment   = mongoose.model('PublicComment'),
	CommentDocument = mongoose.model('CommentDocument'),
	BucketComment   = mongoose.model('BucketComment'),
	P               = require('promise');




var replaceDocuments = function (docmodels) {
	return P.all (docmodels.map (function (docmodel) {
		var pcid = docmodel.publicComment;
		var docid = docmodel._id;
		console.log ('adding document '+docid+' to comment '+pcid);
		return PublicComment.findOne({_id:pcid}).exec()
		.then (function (pc) {
			// if (!pc.documents) pc.documents = [];
			pc.documents.push (docid);
			return pc.save ();
		});
	}));
};
var replaceBuckets = function (bucketmodels) {
	return P.all (bucketmodels.map (function (bucketmodel) {
		var pcid = bucketmodel.publicComment;
		var bid = bucketmodel.bucket;
		console.log ('adding bucket '+bid+' to comment '+pcid);
		return PublicComment.findOne({_id:pcid}).exec()
		.then (function (pc) {
			// if (!pc.buckets) pc.buckets = [];
			pc.buckets.push (bid);
			return pc.save ();
		});
	}));
};




module.exports = function () {

	CommentDocument.find({}).exec()
	.then (replaceDocuments)
	.then (function () {
		return BucketComment.find({}).exec();
	})
	.then (replaceBuckets)
	.catch (function (e) {
		console.log ('error ',e);
	});


};


