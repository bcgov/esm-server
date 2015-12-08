'use strict';
// =========================================================================
//
// Model for activities
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var ActivitySchema  = new Schema ({
	activity       : { type:'ObjectId', default:null, ref:'Activity', index:true, required:'Error setting activity self reference' },
	phase          : { type:'ObjectId', default:null, ref:'Phase'   , index:true },
	project        : { type:'ObjectId', default:null, ref:'Project' , index:true },
	stream         : { type:'ObjectId', default:null, ref:'Stream'  , index:true },
	visibleAtPhase : { type:'ObjectId', default:null, ref:'Phase'   , index:true },
	code           : { type:String    , default:'code'     , index:true, required:'Code is required', lowercase:true, trim:true},
	name           : { type:String    , default:'name', required:'Please enter an activity name' },
	description    : { type:String    , default:'description' },
	access         : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Activity = mongoose.model ('Activity', ActivitySchema);

module.exports = Activity;

