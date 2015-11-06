'use strict';
// =========================================================================
//
// model for Task
//
// =========================================================================

var mongoose = require ('mongoose');

module.exports = mongoose.model ('Task', new mongoose.Schema ({
	name : { type:String, default:'New Task' }
}));
