'use strict';
// =========================================================================
//
// model for Milestone
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('Milestone', new mongoose.Schema ({
	name : { type:String, default:'New Milestone' }
}));
