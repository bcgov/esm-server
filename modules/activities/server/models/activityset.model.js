'use strict';
// =========================================================================
//
// Model for activities
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('ActivitySet', {
	__audit      : true,
	__access     : true,
	activitySet    : { type:'ObjectId', default:null, ref:'ActivitySet', index:true, required:'Error setting activity self reference' },
	project     : { type:'ObjectId', default:null, ref:'Project' , index:true },
	stream      : { type:'ObjectId', default:null, ref:'Stream'  , index:true },
	type        : { type:String, default:'Phase', index:true, enum:['Phase', 'Milestone']},
	code        : { type:String    , default:'code', index:true, required:'Code is required', lowercase:true, trim:true },
	name        : { type:String    , default:'name', required:'Please enter an activity name' },
	description : { type:String    , default:'description' },
	activities  : [ {type: 'ObjectId', ref:'Activity'} ],
	status      : { type: String, default:'Not Started', enum:['Pending', 'In Progress', 'Complete'] },
	overriddenBy : { type:'ObjectId', ref:'User' },
	overrideReason : {type:String, default:'' },
	completed : { type:String, default:'self.taskscomplete'}
});
