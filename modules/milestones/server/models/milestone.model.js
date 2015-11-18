'use strict';
// =========================================================================
//
// Model for milestones
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var MilestoneSchema  = new Schema ({
	code               : { type:String, default:'code' },
	name               : { type:String, default:'New milestone' },
	description        : { type:String, default:'New milestone' },
	status             : { type:String    , default:'Open', enum:['Not Required', 'Not Started', 'In Progress', 'Complete'] },
	phase              : { type:'ObjectId', ref:'Phase'    , index:true },
	dateEstimatedStart : { type:Date, default:Date.now },
	dateEstimatedEnd   : { type:Date, default:Date.now },
	dateActualStart    : { type:Date, default:Date.now },
	dateActualEnd      : { type:Date, default:Date.now },
	access             : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Milestone = mongoose.model ('Milestone', MilestoneSchema);

module.exports = Milestone;

