'use strict';
// =========================================================================
//
// Model for commentDocuments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var CommentDocumentSchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New commentDocument' },
	description : { type:String, default:'New commentDocument' }
});

var CommentDocument = mongoose.model ('CommentDocument', CommentDocumentSchema);

module.exports = CommentDocument;

