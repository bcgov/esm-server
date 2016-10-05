'use strict';
// =========================================================================
//
// Model for Phase
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')('Phase', {
	__audit : true,
	__tracking : true,
	__status : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename  : true,
	//
	// now actual milestones
	//
	milestones            : [ {type: 'ObjectId', ref:'Milestone'} ],
	//
	// default days this phase is set to take
	//
	duration       : { type:Number, default:90 },
	//
	// some arbitrary indicator of progress
	//
	progress              : { type:Number , default:0 },
	//
	// ancestry
	//
	phaseBase             : { type:'ObjectId', ref:'PhaseBase'  , index:true , default:null},
	project               : { type:'ObjectId', ref:'Project', index:true , default:null},
	projectCode           : { type:String, default:'', index:true },
	stream                : { type:'ObjectId', ref:'Stream' , index:true , default:null},
	//
	// if this phase can be marked not required without the work actually being done
	// that is an override and we record who and why
	//
	overridden     : { type:Boolean, default:false },
	overrideReason : { type:String, default:'' },
	//
	// if the phase was completed we record that and also who completed it
	//
	completedBy   : { type:'ObjectId', ref:'User' },
	completed     : { type:Boolean, default:false },
	//
	// the silly order thing
	//
	order	  : { type: Number, default:0 }
});
