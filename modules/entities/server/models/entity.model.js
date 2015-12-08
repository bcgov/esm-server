'use strict';
// =========================================================================
//
// Model for entities
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var EntitySchema  = new Schema ({
	name         : { type:String, default:'name' },
	legalName    : { type:String, default:'legalName' },
	parentName   : { type:String, default:'parentName' },
	website      : { type:String, default:'website' },
	registeredIn : { type:String, default:'registeredIn' },
	type         : { type:String, default:'type' },
	addr1        : { type:String, default:'addr1' },
	addr2        : { type:String, default:'addr2' },
	city         : { type:String, default:'city' },
	province     : { type:String, default:'province' },
	postal       : { type:String, default:'postal' },
	primaryUser  : { type:'ObjectId', ref:'User'}
});

var Entity = mongoose.model ('Entity', EntitySchema);

module.exports = Entity;

