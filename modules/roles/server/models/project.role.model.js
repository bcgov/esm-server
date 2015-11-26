'use strict';
// =========================================================================
//
// Model for roles
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;

var ProjectRoleSchema  = new Schema ({
	code        : { type:String, default:'code' },
	name        : { type:String, default:'New role' },
	description : { type:String, default:'New role' },
	project     : { type:'ObjectId', ref:'Project', index:true , default:null},
	role        : { type:'ObjectId', ref:'Role', index:true , default:null}
});

var ProjectRole = mongoose.model ('ProjectRole', ProjectRoleSchema);

module.exports = ProjectRole;
