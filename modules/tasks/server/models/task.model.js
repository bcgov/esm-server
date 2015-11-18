'use strict';
// =========================================================================
//
// Model for tasks
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var TaskSchema  = new Schema ({
	code          : { type:String, default:'code' },
	name          : { type:String, default:'New task' },
	description   : { type:String, default:'New task' },
	status        : { type:String, default:'Not Started', enum:['Not Started', 'In Progress', 'Complete'] },
	subStatus     : { type:String, default:'' },
	subStatuses   : { type:String, default:'' },
	activity      : { type:'ObjectId', ref:'Activity', index:true },
	requirement   : { type:'ObjectId', ref:'Requirement', index:true },
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

