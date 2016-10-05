'use strict';
// =========================================================================
//
// Model for integrations
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var IntegrationSchema  = new Schema ({
	module        : { type:String , required:true, unique:true },
	runDate : {type:Date, default:null},
	output : {type:String, default:''}
});

IntegrationSchema.pre ('save', function (next) {
	this.runDate = Date.now ();
	next();
});

var Integration = mongoose.model ('Integration', IntegrationSchema);

module.exports = Integration;

