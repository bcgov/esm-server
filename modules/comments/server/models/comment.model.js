'use strict';
// =========================================================================
//
// Model for comments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New comment' },
	description : { type:String, default:'New comment' }
});

var Comment = mongoose.model ('Comment', CommentSchema);

module.exports = Comment;

