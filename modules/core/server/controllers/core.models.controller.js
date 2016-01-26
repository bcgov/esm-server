'use strict';

var mongoose     = require ('mongoose');
var _ = require ('lodash');

// -------------------------------------------------------------------------
//
// things to do with setting access fields
//
// -------------------------------------------------------------------------
var auditFields = {
	dateAdded   : { type: Date },
	dateUpdated : { type: Date },
	addedBy     : { type: 'ObjectId', ref:'User' },
	updatedBy   : { type: 'ObjectId', ref:'User' }
};
// -------------------------------------------------------------------------
//
// it would be best to makke this part of onSave (the pre('save' ...)) but
// there is no elegant way to get the user to bubble up into the handler.
// so instead this will have to be called on save of models explicitly
//
// -------------------------------------------------------------------------
var setAuditFields = function (user) {
	this.updatedBy = (user) ? user._id : null;
	this.dateUpdated = Date.now;
	if ( !this.dateAdded ) {
		this.dateAdded = this.dateUpdated;
		this.addedBy   = this.updatedBy;
	}
};
// -------------------------------------------------------------------------
//
// things to do with handling access stuff
//
// -------------------------------------------------------------------------
var accessFields = {
	read  : [ {type:String} ],
	write : [ {type:String} ],
	submit: [ {type:String} ],
	watch : [ {type:String} ]
};
// -------------------------------------------------------------------------
//
// given a list of user roles just return a hash of permissions
//
// -------------------------------------------------------------------------
var permissions = function (userRoles) {
	return {
		read   : ( (_.intersection (userRoles, this.read)).length > 0),
		write  : ( (_.intersection (userRoles, this.write)).length > 0),
		submit : ( (_.intersection (userRoles, this.submit)).length > 0),
		watch  : ( (_.intersection (userRoles, this.watch)).length > 0)
	};
};
// -------------------------------------------------------------------------
//
// given a user, prepare the user roles (add public etc) and decide if the
// user has the given, sought after, permission
//
// -------------------------------------------------------------------------
var hasPermission = function (user, permission) {
	var userRoles = (user) ? user.roles : [];
	userRoles.push ('public');
	if (_.indexOf (userRoles, 'admin') >= 0) return true;
	var permissions = this.permissions (userRoles);
	return (permissions[permission]) ? true : false;
};
// -------------------------------------------------------------------------
//
// take the passed in schema declaration and create a mongoose schema object
// from it.  return the schema object.  If the definition has certain special
// fields then replace those with the functionality associated with them.
// in this case we have:
// __audit : add the audit fields and functionality
// __access : add the ACL functionality
//
// -------------------------------------------------------------------------
var generateSchema = function (definition) {
	var audit = definition.__audit || false;
	var access = definition.__access || false;
	delete definition.__audit;
	delete definition.__access;
	if (audit) _.extend (definition, auditFields);
	if (access) _.extend (definition, accessFields);
	var schema = new mongoose.Schema (definition);
	if (audit) {
		// schema.pre ('save', auditSaveFunction);
		schema.methods.setAuditFields = setAuditFields;
	}
	if (access) {
		schema.methods.hasPermission = hasPermission;
		schema.methods.permissions   = permissions;
	}
	return schema;
};
// -------------------------------------------------------------------------
//
// where there is no need to mess with the schema further, just go straight
// to making the model itself
//
// -------------------------------------------------------------------------
var generateModel = function (name, definition) {
	return mongoose.model (name, generateSchema (definition));
};

module.exports = {
	auditFields    : auditFields,
	accessFields   : accessFields,
	permissions    : permissions,
	hasPermission  : hasPermission,
	generateSchema : generateSchema,
	generateModel  : generateModel
};
