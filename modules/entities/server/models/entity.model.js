'use strict';
// =========================================================================
//
// Model for entities
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var EntitySchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New entity' },
	type        : { type:String, default:'New entity' },
	description : { type:String, default:'New entity' }
});

var Entity = mongoose.model ('Entity', EntitySchema);

module.exports = Entity;

