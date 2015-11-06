'use strict';
// =========================================================================
//
// model for Phase
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('Phase', new mongoose.Schema ({
	name : { type:String, default:'New Phase' }
}));
