'use strict';
// =========================================================================
//
// Model for phases
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var PhaseSchema  = new Schema ({
	phase                 : { type:'ObjectId', ref:'Phase'  , index:true , default:null},
	project               : { type:'ObjectId', ref:'Project', index:true , default:null},
	stream                : { type:'ObjectId', ref:'Stream' , index:true , default:null},
	code                  : { type:String, default:'code'   , index:true },
	name                  : { type:String, default:'New phase' },
	description           : { type:String, default:'New phase' },
	progress              : { type:Number , default:0 },
	mandatoryDurationDays : { type:Number , default:90 },
	status                : { type:String , default:'Not Started', enum:['Not Required', 'Not Started', 'In Progress', 'Complete'] },
	dateStarted           : { type: Date, default: null }, // date in progress
	dateCompleted         : { type: Date, default: null }, // date complete
	access                : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Phase = mongoose.model ('Phase', PhaseSchema);

module.exports = Phase;

