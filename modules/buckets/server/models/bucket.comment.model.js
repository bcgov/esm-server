'use strict';
// =========================================================================
//
// Model for bucket requirements
//
// this links a bucket to all of its requirements
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var BucketCommentSchema  = new Schema ({
	bucket        : { type:'ObjectId', ref:'Bucket'       , index:true },
	project       : { type:'ObjectId', ref:'Project'      , index:true },
	publicComment : { type:'ObjectId', ref:'PublicComment', index:true }
});

var BucketComment = mongoose.model ('BucketComment', BucketCommentSchema);

module.exports = BucketComment;

