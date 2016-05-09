'use strict';
// =========================================================================
//
// Model for comments
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('CommentPeriod', {
	//
	// for access, if the period is NOT published, then there should be no way
	// to get to a list of comments. it is possible for comments to be published,
	// but not the period, this would mean the overall link would not show, but if
	// a user had a link to a specific comment, they could still follow that
	//
	__audit          : true, // who did what when
	__access         : true, // who can mess with this and how
	__tracking       : true, // start and stop dates
	periodType       : { type:String, default:'Working Group', enum:['Working Group', 'Public']},
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
	//
	// these three define the target of this period
	//
	artifact         : { type:'ObjectId', ref:'Artifact' },
	artifactVersion  : { type:String, default: '' },
	artifactVersionNumber  : { type:String, default:'',  index:true},
	//
	// these are surfaced for query optimization
	//
	artifactName     : { type:String, default: '' },
	artifactTypeCode : { type:String, default: '' },
	//
	// commenter roles, a list of roles that are allowed to post comments
	// if this were a public period this would simply be 'public'
	//
	commenterRoles : [ String ],
	// -------------------------------------------------------------------------
	//
	// these are specific to working group comments
	//
	// -------------------------------------------------------------------------
	//
	// instructions to the commenters
	//
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
	// -------------------------------------------------------------------------
	publishedPercent : { type:Number, default:0.0 },
	isVetted        : { type:Boolean, default:false },
	vettedPercent : { type:Number, default:0.0 },
	isClassified        : { type:Boolean, default:false },
	classifiedPercent : { type:Number, default:0.0 }
},
{
	commenterRoles: 1
}
);


