'use strict';
// =========================================================================
//
// Model for Milestone
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Milestone', {
	__audit       : true,
	__tracking    : true,
	__status      : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename    : true,
	//
	// the list of activity ids that were created and attached to this milestone
	// throughout its lifetime
	//
	activities    : [ {type: 'ObjectId', ref:'Activity'} ],
	//
	// the type of milestone
	//
	type            : { type:String, default:'Artifact', enum:['Artifact', 'Process'] },
	//
	// if an artifact of a specific version is linked, then also link its
	// id here
	//
	artifactType    : { type:String, default:null },
	artifactVersion : { type:String, default:null },
	artifact        : { type:'ObjectId', ref:'Artifact', default:null },
	//
	// if this milestone is ALWAYS attached to a certain phase put the code here
	//
	fixedPhaseCode  : { type:String, default: null},
	//
	// begin immediately upon creation ?
	//
	startOnCreate : { type:Boolean, default:false },
	//
	// ancestry
	//
	milestoneBase : { type:'ObjectId', ref:'MilestoneBase', index:true , default:null},
	phase         : { type:'ObjectId', ref:'Phase'    , index:true , default:null},
	phaseName     : { type:String, default:'', index:true },
	phaseCode     : { type:String, default:'', index:true },
	project       : { type:'ObjectId', ref:'Project'  , index:true , default:null},
	projectCode   : { type:String, default:'', index:true },
	stream        : { type:'ObjectId', ref:'Stream'   , index:true , default:null},
	//
	// if this milestone can be marked not required without the work actually being done
	// that is an override and we record who and why
	//
	overridden     : { type:Boolean, default:false },
	overrideReason : { type:String, default:'' },
	//
	// if the milestone was completed we record that and also who completed it
	//
	completedBy   : { type:'ObjectId', ref:'User' },
	completed     : { type:Boolean, default:false },
	//
	// default days this milestone is set to take
	//
	duration       : { type:Number, default:30 },
	//
	// the order to list the milestone within a phase, meaningless really
	//
	order	      : { type: Number, default:0 },
});

