'use strict';
// =========================================================================
//
// Model for roles
//
// If a role is attahed to a project the project will not be null
// if a role belongs to a stream then project will be null but the stream will not
// system level roles have null projects and streams
//
// =========================================================================
var mongoose     = require ('mongoose');
var Schema       = mongoose.Schema;
var _ = require ('lodash');

var RoleSchema  = new Schema ({
	code       : { type:String, default:'code', index:true, unique:true },
	isSystem   : { type:Boolean, default:false, index:true },
	users      : [{ type:'ObjectId', ref:'User' }],
	projects   : [{ type:'ObjectId', ref:'Project' }],
	phases     : [{ type:'ObjectId', ref:'Phase' }],
	milestones : [{ type:'ObjectId', ref:'Milestone' }],
	activities : [{ type:'ObjectId', ref:'Activity' }],
	features   : [{ type:'ObjectId', ref:'Feature' }]
});

var setUnique = function (a, value) {
	return _.union (a, [value]);
};
var setUniqueArray = function (a, addArray) {
	return _.union (a, addArray);
};

RoleSchema.methods.setUserRole = function (user) {
	this.users = setUnique (this.users, user.toString ());
};

RoleSchema.methods.setUsersRole = function (users) {
	this.users = setUniqueArray (this.users, users.map (function (u) { return u.toString();}));
};

RoleSchema.methods.setObjectRole = function (object, objectId) {
	this[object] = setUnique (this[object], objectId.toString ());
};

RoleSchema.methods.setObjectsRole = function (object, objectIds) {
	this[object] = setUniqueArray (this[object], objectIds.map (function (u) { return u.toString();}));
};

var Role = mongoose.model ('Role', RoleSchema);

module.exports = Role;

