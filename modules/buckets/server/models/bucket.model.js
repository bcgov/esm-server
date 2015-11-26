'use strict';
// =========================================================================
//
// Model for buckets
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var BucketSchema  = new Schema ({
	bucket            : { type:'ObjectId', ref:'Bucket'   , index:true , default:null},
	project           : { type:'ObjectId', ref:'Project'  , index:true , default:null},
	stream            : { type:'ObjectId', ref:'Stream'   , index:true , default:null},
	visibleAtPhase    : { type:'ObjectId', ref:'Phase'    , index:true , default:null},
	code              : { type:String    , default:'code' , index:true },
	name              : { type:String    , default:'New bucket' },
	description       : { type:String    , default:'New bucket' },
	isValueComponment : { type:Boolean   , default:false },
	progress          : { type:Number    , default:0 },
	status            : { type:String    , default:'Not Started', enum:[ 'Not Started', 'In Progress', 'Complete'] },
	access            : {
		read  : { type:String, default:'' },
		write : { type:String, default:'' },
		watch : { type:String, default:'' }
	}
});

var Bucket = mongoose.model ('Bucket', BucketSchema);

module.exports = Bucket;

