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
	internalName    : { type:String, default:'' },
	mime            : { type:String, default:'' },
	ext             : { type:String, default:'' },
	size             : { type:Number, default:0 },
	encoding             : { type:String, default:'' },
	summary         : { type:String, default:'' },
	// original        : { type:'ObjectId', ref:'CommentDocument', default:null },
	eaoStatus       : { type:String, default:'Unvetted', enum:['Unvetted', 'Rejected', 'Deferred', 'Accepted', 'Published'] },
	eaoNotes        : { type:String, default: '' },
	proponentStatus : { type:String, default:'Unclassified', enum:['Unclassified', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' },
	updatedBy       : { type:'ObjectId', ref:'User', default:null },
	dateUpdated     : { type: Date, default: Date.now }
});

var CommentDocument = mongoose.model ('CommentDocument', CommentDocumentSchema);

module.exports = CommentDocument;

