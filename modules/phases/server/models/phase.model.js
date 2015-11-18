'use strict';
// =========================================================================
//
// Model for phases
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var PhaseSchema  = new Schema ({
	code                  : { type:String, default:'code' },
	name                  : { type:String, default:'New phase' },
	description           : { type:String, default:'New phase' },
	project               : { type:'ObjectId', ref:'Project', index:true },
	stream                : { type:'ObjectId', ref:'Stream' , index:true },
	progress              : { type:Number , default:0 },
	mandatoryDurationDays : { type:Number , default:90 },
	status                : { type:String , default:'Not Started', enum:['Not Required', 'Not Started', 'In Progress', 'Complete'] },
	access                : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Phase = mongoose.model ('Phase', PhaseSchema);

module.exports = Phase;

