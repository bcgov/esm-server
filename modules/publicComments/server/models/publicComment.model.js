'use strict';
// =========================================================================
//
// Model for publicComments
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var PublicCommentSchema  = new Schema ({
	project         : { type:'ObjectId', ref:'Project', index:true, required:'Project is required' },
	dateAdded       : { type: Date, default: Date.now },
	author          : { type:String, default:'' },
	comment         : { type:String, default:'' },
	original        : { type:'ObjectId', ref:'PublicComment', default:null },
	eaoStatus       : { type:String, default:'Unvetted', enum:['Unvetted', 'In Progress', 'Rejected', 'Deferred', 'Accepted', 'Published'] },
	overallStatus   : { type:String, default:'Unvetted', enum:['Unvetted', 'In Progress', 'Rejected', 'Deferred', 'Accepted', 'Published'] },
	eaoNotes        : { type:String, default: '' },
	proponentStatus : { type:String, default:'Unclassified', enum:['Unclassified', 'In Progress', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' },
	updatedBy       : { type:'ObjectId', ref:'User', default:null }
});

var PublicComment = mongoose.model ('PublicComment', PublicCommentSchema);

module.exports = PublicComment;

