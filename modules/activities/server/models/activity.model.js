'use strict';
// =========================================================================
//
// Model for activities
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var ActivitySchema  = new Schema ({
	activity       : { type:'ObjectId', ref:'Activity' , index:true , default:null},
	phase          : { type:'ObjectId', ref:'Phase'    , index:true , default:null},
	project        : { type:'ObjectId', ref:'Project'  , index:true , default:null},
	stream         : { type:'ObjectId', ref:'Stream'   , index:true , default:null},
	visibleAtPhase : { type:'ObjectId', ref:'Phase'    , index:true , default:null},
	code           : { type:String, default:'code'     , index:true},
	name           : { type:String, default:'New activity' },
	description    : { type:String, default:'New activity' },
	access         : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Activity = mongoose.model ('Activity', ActivitySchema);

module.exports = Activity;

