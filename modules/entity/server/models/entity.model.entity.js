'use strict';
// =========================================================================
//
// model for Entity
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('Entity', new mongoose.Schema ({
	name : { type:String, default:'' },
	type : { type:String, default:'' }
}));
