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
	code           : { type:String, default:'code', index:true, unique:true },
	name           : { type:String, default:'name', index:false, unique:false },
	projectCode    : { type:String, default:'', index:true },
	orgCode        : { type:String, default:'eao', enum:['eao', 'pro'], index:true },
	roleCode       : { type:String, default:'' },
	isSystem       : { type:Boolean, default:false, index:true },
	isFunctional   : { type:Boolean, default:true, index:true },
	isProjectDefault   : { type:Boolean, default:false, index:false },
	users          : [{ type:'ObjectId', ref:'User' }],
	projects       : [{ type:'ObjectId', ref:'Project' }],
	activities     : [{ type:'ObjectId', ref:'Activity' }],
	features       : [{ type:'ObjectId', ref:'Feature' }],
	artifacts      : [{ type:'ObjectId', ref:'Artifact' }],
	documents      : [{ type:'ObjectId', ref:'Document' }],
	comments       : [{ type:'ObjectId', ref:'Comment' }],
	publiccomments : [{ type:'ObjectId', ref:'PublicComment' }],
	commentperiod  : [{ type:'ObjectId', ref:'CommentPeriod' }]
});

// var setUnique = function (a, value) {
// 	return _.union (a, [value]);
// };
// var setUniqueArray = function (a, addArray) {
// 	return _.union (a, addArray);
// };

// RoleSchema.methods.setUserRole = function (user) {
// 	this.users = setUnique (this.users, user.toString ());
// };

// RoleSchema.methods.setUsersRole = function (users) {
// 	this.users = setUniqueArray (this.users, users.map (function (u) { return u.toString();}));
// };

// RoleSchema.methods.setObjectRole = function (object, objectId) {
// 	this[object] = setUnique (this[object], objectId.toString ());
// };

// RoleSchema.methods.setObjectsRole = function (object, objectIds) {
// 	this[object] = setUniqueArray (this[object], objectIds.map (function (u) { return u.toString();}));
// };

RoleSchema.methods.modObject = function (method, type, array) {
	// console.log ('role.modobject', method, type, array);
	var inputarray = array.map (function (id) {return id.toString();});
	var typearray = this[type].map (function (id) {return id.toString();});
	if (method === 'add') {
		typearray = _.union (typearray, inputarray);
	}
	else if (method === 'remove') {
		_.remove (typearray, function (id) {
			return _.indexOf (inputarray, id) !== -1;
		});
	}
	else {
		typearray = _.union ([], inputarray);
	}
	this[type] = typearray;
};

RoleSchema.methods.generateCode = function () {
	var a = [];
	if (this.projectCode) a.push (this.projectCode);
	if (this.orgCode) a.push (this.orgCode);
	if (this.roleCode) a.push (this.roleCode);
	this.code = a.join (':');
};

var Role = mongoose.model ('Role', RoleSchema);

module.exports = Role;

