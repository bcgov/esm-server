'use strict';
// =========================================================================
//
// Model for activities
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var ActivitySchema  = new Schema ({
	code           : { type:String, default:'code' },
	name           : { type:String, default:'New activity' },
	description    : { type:String, default:'New activity' },
	phase          : { type:'ObjectId', ref:'Phase'    , index:true },
	visibleAtPhase : { type:'ObjectId', ref:'Phase'    , index:true },
	access         : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Activity = mongoose.model ('Activity', ActivitySchema);

module.exports = Activity;

