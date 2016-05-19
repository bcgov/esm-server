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
	requirement : { type:'ObjectId', ref:'Requirement' , index:true , default:null},
	task        : { type:'ObjectId', ref:'Task'        , index:true , default:null},
	activity    : { type:'ObjectId', ref:'Activity'    , index:true , default:null},
	phase       : { type:'ObjectId', ref:'Phase'       , index:true , default:null},
	project     : { type:'ObjectId', ref:'Project'     , index:true , default:null},
	stream      : { type:'ObjectId', ref:'Stream'      , index:true , default:null},
	milestone   : { type:'ObjectId', ref:'Milestone'   , index:true , default:null},
});

var Requirement = mongoose.model ('Requirement', RequirementSchema);

module.exports = Requirement;

