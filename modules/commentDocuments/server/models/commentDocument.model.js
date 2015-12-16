'use strict';
// =========================================================================
//
// Model for commentDocuments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var CommentDocumentSchema  = new Schema ({
	project         : { type:'ObjectId', ref:'Project', default:null },
	publicComment   : { type:'ObjectId', ref:'PublicComment', default:null },
	dateAdded       : { type: Date, default: Date.now },
	url             : { type:String, default:'' },
	name            : { type:String, default:'' },
	summary         : { type:String, default:'' },
	// original        : { type:'ObjectId', ref:'CommentDocument', default:null },
	eaoStatus       : { type:String, default:'code', enum:['Unvetted', 'Rejected', 'Deferred', 'Accepted', 'Published'] },
	eaoNotes        : { type:String, default: '' },
	proponentStatus : { type:String, default:'code', enum:['Unclassified', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' }
});

var CommentDocument = mongoose.model ('CommentDocument', CommentDocumentSchema);

module.exports = CommentDocument;

