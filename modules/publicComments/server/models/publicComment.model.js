'use strict';
// =========================================================================
//
// Model for publicComments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var PublicCommentSchema  = new Schema ({
	dateAdded       : { type: Date, default: Date.now },
	author          : { type:String, default:'' },
	comment         : { type:String, default:'' },
	original        : { type:'ObjectId', ref:'PublicComment', default:null },
	eaoStatus       : { type:String, default:'code', enum:['Unvetted', 'Rejected', 'Deferred', 'Vetted', 'Published'] },
	overallStatus   : { type:String, default:'code', enum:['Unvetted', 'Vetted', 'Unclassified', 'Classified', 'Published'] }
	eaoNotes        : { type:String, default: '' },
	proponentStatus : { type:String, default:'code', enum:['Unclassified', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' }
});

var PublicComment = mongoose.model ('PublicComment', PublicCommentSchema);

module.exports = PublicComment;

