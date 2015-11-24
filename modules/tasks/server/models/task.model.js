'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var TaskSchema  = new Schema ({
	task          : { type:'ObjectId', ref:'Task'       , index:true , default:null},
	activity      : { type:'ObjectId', ref:'Activity'   , index:true , default:null},
	phase         : { type:'ObjectId', ref:'Phase'      , index:true , default:null},
	project       : { type:'ObjectId', ref:'Project'    , index:true , default:null},
	stream        : { type:'ObjectId', ref:'Stream'     , index:true , default:null},
	code          : { type:String, default:'code', index:true },
	name          : { type:String, default:'New task' },
	description   : { type:String, default:'New task' },
	status        : { type:String, default:'Not Started', enum:['Not Started', 'In Progress', 'Complete'] },
	subStatus     : { type:String, default:'' },
	subStatuses   : { type:String, default:'' },
	processCode   : { type:String, default:'' },
	prerequisites : [
		{ type:'ObjectId', ref:'Requirement' }
	],
	access        : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Task = mongoose.model ('Task', TaskSchema);

module.exports = Task;

