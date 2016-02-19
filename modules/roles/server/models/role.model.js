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
	users      : [{ type:'ObjectId', ref:'User' }],
	projects   : [{ type:'ObjectId', ref:'Project' }],
	phases     : [{ type:'ObjectId', ref:'Phase' }],
	milestones : [{ type:'ObjectId', ref:'Milestone' }],
	activities : [{ type:'ObjectId', ref:'Activity' }]
});

var setUnique = function (a, value) {
	a.push (value);
	// console.log ('a after push = ', a);
	var b = _.uniq (a, function (a, b) {
		return (a.equals(b));
	});
	// console.log ('b after uniq = ', b);
	return b;
};
var setUniqueArray = function (a, addArray) {
	return _.uniq (a.concat (addArray), function (a, b) {
		return (a.equals(b));
	});
};

RoleSchema.methods.setUserRole = function (user) {
	this.users = setUnique (this.users, user);
};
RoleSchema.methods.setUsersRole = function (users) {
	this.users = setUniqueArray (this.users, users);
};

RoleSchema.methods.setObjectRole = function (object, objectId) {
	console.log ('setting object role in model ', object, objectId, this[object]);
	var newa = setUnique (this[object], objectId);
	console.log ('result ', newa);
	this[object] = newa;
};

RoleSchema.methods.setObjectsRole = function (object, objectIds) {
	this[object] = setUniqueArray (this[object], objectIds);
};

var Role = mongoose.model ('Role', RoleSchema);

module.exports = Role;

