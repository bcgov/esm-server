'use strict';
// =========================================================================
//
// Model for buckets
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var BucketSchema  = new Schema ({
	code              : { type:String    , default:'code' },
	name              : { type:String    , default:'New bucket' },
	description       : { type:String    , default:'New bucket' },
	project           : { type:'ObjectId', ref:'Project'  , index:true },
	stream            : { type:'ObjectId', ref:'Stream'   , index:true },
	visibleAtPhase    : { type:'ObjectId', ref:'Phase'    , index:true },
	isValueComponment : { type:Boolean   , default:false },
	progress          : { type:Number    , default:0 },
	status            : { type:String    , default:'Open', enum:['Not Required', 'Not Started', 'In Progress', 'Complete'] },
	access            : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Bucket = mongoose.model ('Bucket', BucketSchema);

module.exports = Bucket;

