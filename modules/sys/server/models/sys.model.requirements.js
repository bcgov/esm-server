'use strict';
// =========================================================================
//
// model for Requirement
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('Requirement', new mongoose.Schema ({
	name : { type:String, default:'New Requirement' }
}));
