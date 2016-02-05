'use strict';
// =========================================================================
//
// Model for Phase
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Phase', {
	__audit : true,
	__access: true,
	__tracking : true,
	__status : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename  : true,
	priorPhase            : { type: 'ObjectId', ref:'Phase' },
	milestones            : [ {type: 'ObjectId', ref:'Milestone'} ],
	progress              : { type:Number , default:0 },
	mandatoryDurationDays : { type:Number , default:90 },
	phaseBase             : { type:'ObjectId', ref:'PhaseBase'  , index:true , default:null},
	project               : { type:'ObjectId', ref:'Project', index:true , default:null},
	projectCode           : { type:String, default:'', index:true },
	stream                : { type:'ObjectId', ref:'Stream' , index:true , default:null},
	completed : { type:Boolean, default:false}
});
