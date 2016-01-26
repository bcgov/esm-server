'use strict';
// =========================================================================
//
// Model for activities
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Activity', {
	__audit      : true,
	__access     : true,
	activity    : { type:'ObjectId', default:null, ref:'Activity', index:true, required:'Error setting activity self reference' },
	project     : { type:'ObjectId', default:null, ref:'Project' , index:true },
	stream      : { type:'ObjectId', default:null, ref:'Stream'  , index:true },
	code        : { type:String    , default:'code', index:true, required:'Code is required', lowercase:true, trim:true },
	name        : { type:String    , default:'name', required:'Please enter an activity name' },
	description : { type:String    , default:'description' },
	processCode : { type:String    , default:'' },
	tasks       : [ {type: 'ObjectId', ref:'Task'} ],
	status      : { type: String, default:'Not Started', enum:['Pending', 'In Progress', 'Complete'] },
	overriddenBy : { type:'ObjectId', ref:'User' },
	overrideReason : {type:String, default:'' },
	completed : { type:String, default:'self.tasksComplete'}
});
