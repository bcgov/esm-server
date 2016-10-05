'use strict';
// =========================================================================
//
// Model for comments
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Comment', {
	__audit    : true,  // who did what and when
	__access   : [],  // who gets what sort of access to this comment
	//
	// this comes along just for ease of querying
	//
	project          : { type:'ObjectId', ref:'Project', default:null, index:true },
	//
	// the period contains most of the meta data we need and each
	// set of comments is defined by a period
	//
	period           : { type:'ObjectId', ref:'CommentPeriod', default:null, index:true },
	//
	// if this comment is linked as a response to another comment then this
	// field holds the reference to that comment
	//
	parent           : { type:'ObjectId', ref:'Comment', default:null, index:true },
	//
	// if this is part of a chain of comments then the originating comment
	// is the ancestor (the head of the chain)
	//
	ancestor         : { type:'ObjectId', ref:'Comment', default:null, index:true },
	//
	// if the comment was modified or redacted this is a pointer to the original
	//
	original         : { type:'ObjectId', ref:'Comment', default:null, index:true },
	//
	// the comment itself
	//
	comment          : { type:String, default:'' },
	//
	// a list of attachments, if any
	//
	documents        : [{ type:'ObjectId', ref:'Document' }],
	//
	// valuedComponents
	//
	valuedComponents : [{ type:'ObjectId', ref:'Vc' }],
	pillars          : [String],
	topics           : [String],

	// ESM-431 - want each comment within a period to have a unique number (not guid)
	//           for export and sorting
	commentId: {type: Number},
	// -------------------------------------------------------------------------
	//
	// for public comments
	//
	// -------------------------------------------------------------------------
	//
	// a free form field for the author to put her name and a flag indicating her
	// wish to be anonymous or not
	//
	author      : { type:String, default:'' },
	isAnonymous : { type:Boolean, default:true },
	//
	// a free form field indicating location, also affected by the isAnonymous
	// flag
	//
	location    : { type:String, default:'' },
	//
	// the eao work flow, status and internal notes. If the comment is rejected
	// then indicate why
	//
	eaoStatus      : { type:String, default:'Unvetted', enum:['Unvetted', 'Rejected', 'Deferred', 'Accepted', 'Published', 'Spam'] },
	eaoNotes       : { type:String, default: '' },
	rejectedNotes  : { type:String, default: '' },
	rejectedReason : { type:String, default: '' },
	publishedNotes : { type:String, default: '' },
	//
	// the proponent work flow, classified or not with notes
	//
	proponentStatus : { type:String, default:'Unclassified', enum:['Unclassified', 'In Progress', 'Deferred', 'Classified'] },
	proponentNotes  : { type:String, default: '' },
	// -------------------------------------------------------------------------
	//
	// for working group comment
	//
	// -------------------------------------------------------------------------
	//
	// is this considered resolved and who said so?
	//
	isResolved    : { type:Boolean, default:false },
	resolvedBy    : { type:'ObjectId', ref:'User', default:null },
	resolvedNotes : { type:String, default: '' },
	//
	// if there is a response to this comment, link it here, comments may
	// share responses
	//
	response : { type:'ObjectId', ref:'CommentResponse', default:null, index:true },
});

