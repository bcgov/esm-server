'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
module.exports = require ('../../../core/server/controllers/core.models.controller')
.generateModel ('Task', {
	__audit : true,
	name          : { type:String, default:'New task' },
	description   : { type:String, default:'New task' },
	isRequired    : { type:Boolean, default:true },
	taskBase      : { type:'ObjectId', ref:'TaskBase', index:true , default:null},
	activity      : { type:'ObjectId', ref:'Activity', index:true , default:null},
	milestone      : { type:'ObjectId', default:null, ref:'Milestone'   , index:true },
	phase          : { type:'ObjectId', default:null, ref:'Phase'       , index:true },
	project        : { type:'ObjectId', default:null, ref:'Project'     , index:true },
	projectCode    : { type:String, default:'', index:true },
	stream         : { type:'ObjectId', default:null, ref:'Stream'      , index:true },
	dateCompleted : { type:Date, default: null }, // date complete
	completedBy   : { type:'ObjectId', ref:'User' },
	completed     : { type:Boolean, default:false }
});
