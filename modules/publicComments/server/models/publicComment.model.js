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
	classification  : [ String ], 
	author          : { type:String, default:'' },
	location		 : { type:String, default:'' },
	displayName	 : { type:Boolean, default:false },	
	comment         : { type:String, default:'' },
	original        : { type:'ObjectId', ref:'PublicComment', default:null },
	eaoStatus       : { type:String, default:'Unvetted', enum:['Unvetted', 'Rejected', 'Deferred', 'Accepted', 'Published', 'Spam'] },
	overallStatus   : { type:String, default:'Unvetted', enum:['Unvetted', 'In Progress', 'Rejected', 'Deferred', 'Accepted', 'Published', 'Spam'] },
	eaoNotes        : { type:String, default: '' },
	proponentStatus : { type:String, default:'Unclassified', enum:['Unclassified', 'In Progress', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' },
	rejectedNotes	 : { type:String, default: '' },
	rejectedReason	 : { type:String, default: '' },
	updatedBy       : { type:'ObjectId', ref:'User', default:null },
	dateUpdated     : { type: Date, default: Date.now }
});

var PublicComment = mongoose.model ('PublicComment', PublicCommentSchema);

module.exports = PublicComment;

