'use strict';
// =========================================================================
//
// Model for requirements
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var RequirementSchema  = new Schema ({
	code        : { type:String , default:'code' },
	name        : { type:String , default:'New requirement' },
	description : { type:String , default:'New requirement' },
	type        : { type:String , default:'document' },
	value       : { type:Boolean, default:false },
	project     : { type:'ObjectId', ref:'Project'  , index:true },
	stream      : { type:'ObjectId', ref:'Stream'   , index:true },
	phase       : { type:'ObjectId', ref:'Phase'    , index:true },
	activity    : { type:'ObjectId', ref:'Activity' , index:true },
	task        : { type:'ObjectId', ref:'Task'     , index:true },
	milestone   : { type:'ObjectId', ref:'Milestone', index:true },
	bucket      : { type:'ObjectId', ref:'Bucket'   , index:true }
});

var Requirement = mongoose.model ('Requirement', RequirementSchema);

module.exports = Requirement;

