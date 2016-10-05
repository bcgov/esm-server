'use strict';
// =========================================================================
//
// Model for activity set Base
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('MilestoneBase', {
	__codename      : true,
	//
	// a list of activity codes that need to be created and attached to
	// this when it becomes a real milestone
	//
	activities      : [ {type:String} ],
	//
	// if this milestone is ALWAYS attached to a certain phase put the code here
	//
	fixedPhaseCode  : { type:String, default: null},
	//
	// begin immediately upon creation ?
	//
	startOnCreate : { type:Boolean, default:false },
	//
	// is this milestone a process or artifact type
	//
	type            : { type:String, default:'Artifact', enum:['Artifact', 'Process'] },
	//
	// for either type this milestone may be attached to an artifact of a specific version
	//
	artifactType    : { type:String, default:null },
	artifactVersion : { type:String, default:null },
	//
	// default days this milestone is set to take
	//
	duration       : { type:Number, default:30 },
	//
	// the order to list the milestone within a phase, meaningless really
	//
	order           : { type: Number, default:0 },
});

