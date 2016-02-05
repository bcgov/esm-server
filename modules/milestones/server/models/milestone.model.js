'use strict';
// =========================================================================
//
// Model for Milestone
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Milestone', {
	__audit       : true,
	__access      : true,
	__tracking    : true,
	__status      : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename    : true,
	activities    : [ {type: 'ObjectId', ref:'Activity'} ],
	milestoneBase : { type:'ObjectId', ref:'MilestoneBase', index:true , default:null},
	phase         : { type:'ObjectId', ref:'Phase'    , index:true , default:null},
	project       : { type:'ObjectId', ref:'Project'  , index:true , default:null},
	projectCode   : { type:String, default:'', index:true },
	stream        : { type:'ObjectId', ref:'Stream'   , index:true , default:null},
	completed     : { type:Boolean, default:false}
});

