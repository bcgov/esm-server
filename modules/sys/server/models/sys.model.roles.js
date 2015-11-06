'use strict';
// =========================================================================
//
// model for Role
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('Role', new mongoose.Schema ({
	name : { type:String, default:'New Role' }
}));
