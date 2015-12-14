'use strict';
// =========================================================================
//
// Model for commentDocuments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var CommentDocumentSchema  = new Schema ({
	url             : { type:String, default:'' },
	name            : { type:String, default:'' },
	summary         : { type:String, default:'' }
	original        : { type:'ObjectId', ref:'PublicComment', default:null },
	eaoStatus       : { type:String, default:'code', enum:['Unvetted', 'Rejected', 'Deferred', 'Vetted', 'Published'] },
	eaoNotes        : { type:String, default: '' },
	proponentStatus : { type:String, default:'code', enum:['Unclassified', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' }
});

var CommentDocument = mongoose.model ('CommentDocument', CommentDocumentSchema);

module.exports = CommentDocument;

