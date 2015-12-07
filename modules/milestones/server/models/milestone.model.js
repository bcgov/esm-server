'use strict';
// =========================================================================
//
// Model for milestones
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var MilestoneSchema  = new Schema ({
	milestone          : { type:'ObjectId', ref:'Milestone', index:true , default:null},
	phase              : { type:'ObjectId', ref:'Phase'    , index:true , default:null},
	project            : { type:'ObjectId', ref:'Project'  , index:true , default:null},
	stream             : { type:'ObjectId', ref:'Stream'   , index:true , default:null},
	code               : { type:String, default:'code'     , index:true },
	name               : { type:String, default:'New milestone' },
	description        : { type:String, default:'New milestone' },
	status             : { type:String, default:'Not Required', enum:['Not Required', 'Not Started', 'In Progress', 'Complete'] },
	dateEstimatedStart : { type:Date },
	dateEstimatedEnd   : { type:Date },
	dateActualStart    : { type:Date },
	dateActualEnd      : { type:Date },
	access             : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Milestone = mongoose.model ('Milestone', MilestoneSchema);

module.exports = Milestone;

