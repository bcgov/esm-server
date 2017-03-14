'use strict';
var _                   = require ('lodash');
// =========================================================================
//
// Model for comments
//
// =========================================================================
var STATES = ['','Invalid', 'Unpublished',  'Completed', 'Pending','Open'];

var newStatics = {};

/*
For a project's list of PCP determine the highest ranking OpenState.
 */
newStatics.MaxOpenState = function (pcpList) {
	var max = 0;
	_.each(pcpList, function (period) {
		var rank = period.openState.rank;
		max = rank > max ? rank : max;
	});
	return STATES[max];
};

/*
For a given instance of CommentPeriod provide the calculated OpenState property
 */
function calculateOpenState() {
	var model = this;
	var EMPTY = 0;
	var INV = STATES.indexOf('Invalid');
	var UNP = STATES.indexOf('Unpublished');
	var COMP = STATES.indexOf('Completed');
	var PEND = STATES.indexOf('Pending');
	var OPEN = STATES.indexOf('Open');
	var rank = EMPTY;
	if (model.isPublished) {
		var today = new Date();
		var start = new Date(model.dateStarted);
		var end = new Date(model.dateCompleted);
		var isOpen = start <= today && today <= end;
		if (isOpen) {
			rank=OPEN;
		} else {
			if (today < start) {
				rank = PEND;
			} else if (today > end) {
				rank = COMP;
			} else {
				rank = INV;
			}
		}
	} else {
		rank = UNP;
	}
	return {state: STATES[rank], rank: rank };
}


module.exports = require ('../../../core/server/controllers/core.schema.controller')
('CommentPeriod', {
	//
	// for access, if the period is NOT published, then there should be no way
	// to get to a list of comments. it is possible for comments to be published,
	// but not the period, this would mean the overall link would not show, but if
	// a user had a link to a specific comment, they could still follow that
	//
	__audit          : true, // who did what when
	__access: [
		'vetComments',
		'classifyComments',
		'listComments',
		'addComment',
		'publish',
		'unPublish'
	],
	__tracking       : true, // start and stop dates

	// storing two UI selections to provide means to edit a PCP with choices made on create
	rangeType        : { type:String, enum:['start', 'end', 'custom']},
	rangeOption      : { type:String, enum:['30', '45', '60', '75', 'custom']},

	periodType       : { type:String, default:'Public', enum:['Working Group', 'Public']},
	//
	// what project and phase this comes under. the milestone actually has all this
	// information, but putting them all at this level is for query optimization
	//
	project          : { type:'ObjectId', ref:'Project', default:null, index:true },
	phase            : { type:'ObjectId', ref:'Phase', default:null, index:true },
	milestone        : { type:'ObjectId', ref:'Milestone', default:null, index:true },
	//
	// for query optimization
	//
	phaseName        : { type:String, default: '' },

	relatedDocuments: [{type: 'ObjectId', ref: 'Document'}],

	//
	// commenter roles, a list of roles that are allowed to post comments
	// if this were a public period this would simply be 'public'
	//
	commenterRoles : [ {type:String} ],
	// -------------------------------------------------------------------------
	//
	// these are specific to working group comments
	//
	// -------------------------------------------------------------------------
	//
	// instructions to the commenters. PCP editors can edit the additionalText and informationLabel fields.
	// These are combined with the date to compose the read only informationLabel.
	//
	informationLabel : { type:String, default: '' },
	additionalText	 : { type:String, default: '' },
	instructions     : { type:String, default: '' },
	//
	// is this entire comment period considered resolved, this is a calculated
	// field, derived from AND ing the corresponding field in ALL comments
	// the resolved percent below is also derived in the same fashion as a percent
	// of all comments which are resolved
	//
	isResolved         : { type:Boolean, default:false },
	resolvedPercent  : { type:Number, default:0.0 },
	// -------------------------------------------------------------------------
	//
	// these are specific to public comments
	//
	//
	// -------------------------------------------------------------------------
	vettingRoles : [ {type:String} ],
	classificationRoles : [ {type:String} ],
	//
	// a space for holding open house info
	//
	openHouses : [{
		eventDate   : {type:Date, default:null},
		description : {type:String, default:''}
	}],
	//
	// has the entire set of comments been published ?
	// note: isPublished is already present because of __access
	//
	publishedPercent  : { type:Number, default:0.0 },
	//
	// has entire set of comments
	//
	isVetted          : { type:Boolean, default:false },
	vettedPercent     : { type:Number, default:0.0 },
	isClassified      : { type:Boolean, default:false },
	classifiedPercent : { type:Number, default:0.0 },
	indexes__ : [{
		commenterRoles: 1
	}],
	virtuals__ : [
		{name:'openState', get: calculateOpenState}
	],
	statics__               : newStatics
});



