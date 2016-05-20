'use strict';
// =========================================================================
//
// Model for bucket requirements
//
// this links a bucket to all of its requirements
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var BucketRequirementSchema  = new Schema ({
	bucket      : { type:'ObjectId', ref:'Bucket'      , index:true },
	project     : { type:'ObjectId', ref:'Project'     , index:true },
	stream      : { type:'ObjectId', ref:'Stream'      , index:true },
	requirement : { type:'ObjectId', ref:'Requirement' , index:true },
});

var BucketRequirement = mongoose.model ('BucketRequirement', BucketRequirementSchema);

module.exports = BucketRequirement;

