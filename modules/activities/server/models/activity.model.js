'use strict';
// =========================================================================
//
// Model for activities
//
// =========================================================================
var path     = require('path');
var models  = require (require('path').resolve('./modules/core/server/controllers/core.models.controller'));
var _ = require ('lodash');
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var ActivitySchema  = {
	activity       : { type:'ObjectId', default:null, ref:'Activity', index:true, required:'Error setting activity self reference' },
	phase          : { type:'ObjectId', default:null, ref:'Phase'   , index:true },
	project        : { type:'ObjectId', default:null, ref:'Project' , index:true },
	stream         : { type:'ObjectId', default:null, ref:'Stream'  , index:true },
	visibleAtPhase : { type:'ObjectId', default:null, ref:'Phase'   , index:true },
	code           : { type:String    , default:'code'     , index:true, required:'Code is required', lowercase:true, trim:true},
	name           : { type:String    , default:'name', required:'Please enter an activity name' },
	description    : { type:String    , default:'description' },
};

//
// add the audit fields and access fields
//
_.extend (ProjectSchema, control.auditFields);
_.extend (ProjectSchema, control.accessFields);
ActivitySchema  = new Schema (ActivitySchema);

var Activity = mongoose.model ('Activity', ActivitySchema);

module.exports = Activity;

