'use strict';
// =========================================================================
//
// Model for Activity
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.schema.controller')
('Activity', {
	__audit        : true,
	__access       : [],
	__tracking     : true,
	__status       : ['Not Started', 'Not Required', 'In Progress', 'Complete'],
	__codename     : true,
	//
	// the entire ancestry of this activity, so we can fimnd them all and group
	// then all whichever way we want to.
	//
	activityBase : { type:'ObjectId', default:null, ref:'ActivityBase', index:true},
	milestone    : { type:'ObjectId', default:null, ref:'Milestone'   , index:true },
	phase        : { type:'ObjectId', default:null, ref:'Phase'       , index:true },
	phaseName    : { type:String, default:'', index:true },
	phaseCode    : { type:String, default:'', index:true },
	project      : { type:'ObjectId', default:null, ref:'Project'     , index:true },
	projectCode  : { type:String, default:'', index:true },
	stream       : { type:'ObjectId', default:null, ref:'Stream'      , index:true },
	//
	// if this activity can be marked not required without the work actually being done
	// that is an override and we record who and why
	//
	overridden     : { type:Boolean, default:false },
	overrideReason : { type:String, default:'' },
	//
	// if the activity was completed we record that and also who completed it
	//
	completedBy   : { type:'ObjectId', ref:'User' },
	completed     : { type:Boolean, default:false },
	//
	// should this activity begin immediately upon creation
	//
	startOnCreate : { type:Boolean, default:false },
	//
	// order to list this in on config screen
	//
	order          : { type: Number, default:0 },
	//
	// default length of time this activity is set to take
	//
	duration       : { type:Number, default:14 },
	//
	// the name of the state to transition to in the user interface
	// this will be a key that gets matched in the ui, just in case the
	// ui states change over time and the front and back get out of sync
	//
	state          : { type:String, default:'' },
	//
	// the data that gets passed along with the state in order to provide
	// context, this will typically be project code and / or some other
	// keyed information for the ui to consume and find its way to the
	// right screen
	//
	data           : {}
});
