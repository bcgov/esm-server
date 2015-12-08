'use strict';
// =========================================================================
//
// Model for publicComments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var PublicCommentSchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New publicComment' },
	description : { type:String, default:'New publicComment' }
});

var PublicComment = mongoose.model ('PublicComment', PublicCommentSchema);

module.exports = PublicComment;

