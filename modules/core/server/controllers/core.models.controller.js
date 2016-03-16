'use strict';

var mongoose     = require ('mongoose');
var _ = require ('lodash');

// -------------------------------------------------------------------------
//
// things to do with setting access fields
//
// -------------------------------------------------------------------------
var auditFields = {
	dateAdded   : { type: Date , default:null},
	dateUpdated : { type: Date , default:null},
	addedBy     : { type: 'ObjectId', ref:'User', default:null },
	updatedBy   : { type: 'ObjectId', ref:'User', default:null }
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
	this.dateUpdated = Date.now ();
	if ( !this.dateAdded ) {
		this.dateAdded = this.dateUpdated;
		this.addedBy   = this.updatedBy;
	}
};
// -------------------------------------------------------------------------
//
// tracking is the start and end dates for everything
//
// -------------------------------------------------------------------------
var trackingFields = {
	dateStarted      : { type: Date, default: null }, // date in progress
	dateCompleted    : { type: Date, default: null }, // date complete
	dateStartedEst   : { type: Date, default: null }, // date in progress
	dateCompletedEst : { type: Date, default: null } // date complete
};
// -------------------------------------------------------------------------
//
// things to do with handling access stuff
// roles is set to the totla set of roles
// userPermissions gets set on find(), shows the users individual permissions
//
// -------------------------------------------------------------------------
var accessFields = {
	read  : [ {type:String} ],
	write : [ {type:String} ],
	submit: [ {type:String} ],
	watch : [ {type:String} ],
	roles : [ {type:String} ],
	userPermissions : {}
};
// -------------------------------------------------------------------------
//
// given a list of user roles just return a hash of permissions
//
// -------------------------------------------------------------------------
var permissions = function (userRoles) {
	var isadmin = (_.indexOf (userRoles, 'admin') >= 0);
	var watch  = ((_.intersection (userRoles, this.watch)).length > 0);
	var submit = isadmin || ((_.intersection (userRoles, this.submit)).length > 0);
	var write  = submit || ((_.intersection (userRoles, this.write)).length > 0);
	var read   = watch || write  || ((_.intersection (userRoles, this.read)).length > 0);
	return {
		read   : read,
		write  : write,
		submit : submit,
		watch  : watch
	};
};
var roleSet = function () {
	return {
		read   : this.read,
		write  : this.write,
		submit : this.submit,
		watch  : this.watch
	};
};
var allRoles = function () {
	return _.union (this.read, this.write, this.submit, this.watch);
};
// -------------------------------------------------------------------------
//
// given a user, prepare the user roles (add public etc) and decide if the
// user has the given, sought after, permission
//
// -------------------------------------------------------------------------
var hasPermission = function (userRoles, permission) {
	// console.log ('roles are', userRoles);
	if (_.indexOf (userRoles, 'admin') >= 0) return true;
	var permissions = this.permissions (userRoles);
	// console.log ('permission = ', permission);
	return (permissions[permission]) ? true : false;
};
var userHasPermission = function (user, permission) {
	var userRoles = (user) ? user.roles : [];
	userRoles.push ('public');
	return this.hasPermission (userRoles, permission);
};
// -------------------------------------------------------------------------
//
// replace all project:role names with the proper ones using the project code
//
// -------------------------------------------------------------------------
var fixRoles = function (projectCode) {
	var repl = projectCode + ':';
	this.read = this.read.map (function (role) { return role.replace ('project:', repl); });
	this.write = this.write.map (function (role) { return role.replace ('project:', repl); });
	this.submit = this.submit.map (function (role) { return role.replace ('project:', repl); });
	this.watch = this.watch.map (function (role) { return role.replace ('project:', repl); });
	this.roles = this.allRoles ();
};
// -------------------------------------------------------------------------
//
// same as above but returns the fixed array
//
// -------------------------------------------------------------------------
var fixRoleArray = function (projectCode, roleArray) {
	return roleArray.map (function (role) { return role.replace ('project:', projectCode+':'); });
};
// -------------------------------------------------------------------------
//
// three for the price of one!
//
// -------------------------------------------------------------------------
var mergeRoles = function (projectCode, pObject) {
	var self = this;
	_.each (pObject, function (p, i) {
		self[i] = _.union (self[i], p.map (function (role) {
			return role.replace ('project:', projectCode+':');
		}));
	});
	this.roles = this.allRoles ();
};
// -------------------------------------------------------------------------
//
// same as merge, but without the replace as it is done elsewhere
//
// -------------------------------------------------------------------------
var addRoles = function (pObject) {
	var self = this;
	_.each (pObject, function (p, i) {
		self[i] = _.union (self[i], p);
	});
	this.roles = this.allRoles ();
};
// -------------------------------------------------------------------------
//
// remove a set of roles
//
// -------------------------------------------------------------------------
var removeRoles = function (pObject) {
	var self = this;
	_.each (pObject, function (p, i) {
		_.remove (self[i], function (val) {
			return _.indexOf (p, val) !== -1;
		});
	});
	this.roles = this.allRoles ();
};
// -------------------------------------------------------------------------
//
// absolutely define the roles
//
// -------------------------------------------------------------------------
var setRoles = function (pObject) {
	this.read   = pObject.read   || [] ;
	this.write  = pObject.write  || [] ;
	this.submit = pObject.submit || [] ;
	this.watch  = pObject.watch  || [] ;
	this.roles  = this.allRoles ();
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
var generateSchema = function (definition, indexes) {
	var audit = definition.__audit || false;
	var access = definition.__access || false;
	var tracking = definition.__tracking || false;
	var status = definition.__status || false;
	var codename = definition.__codename || false;
	var statics = definition.__statics || false;
	var methods = definition.__methods || false;
	var preSave = definition.__preSave || false;
	delete definition.__audit;
	delete definition.__access;
	delete definition.__tracking;
	delete definition.__status;
	delete definition.__codename;
	delete definition.__statics;
	delete definition.__methods;
	delete definition.__preSave;

	if (audit) definition = _.extend (definition, auditFields);
	if (access) definition = _.extend (definition, accessFields);
	if (tracking) definition = _.extend (definition, trackingFields);
	if (status) definition.status = {
		type    : String,
		default : status[0],
		enum    : status
	};
	if (codename) {
		var index = (codename === 'unique') ? {unique:true} : true;
		// console.log (index);
		definition = _.extend (definition, {
			code        : { type:String, default:'', required:'Code is required', index:index, lowercase:true, trim:true},
			name        : { type:String, default:'', required:'name is required' },
			description : { type:String, default:'' }
		});
	}
	var schema = new mongoose.Schema (definition);
	if (methods) { 
		_.extend(schema.methods, methods);
	}
	if (statics) {
		_.extend(schema.statics, statics);
	}
	if (audit) {
		if (preSave) {
			schema.pre ('save', preSave);
		}
		schema.methods.setAuditFields = setAuditFields;
	}
	if (access) {
		schema.methods.userHasPermission = userHasPermission;
		schema.methods.hasPermission     = hasPermission;
		schema.methods.permissions       = permissions;
		schema.methods.fixRoles          = fixRoles;
		schema.methods.fixRoleArray      = fixRoleArray;
		schema.methods.mergeRoles        = mergeRoles;
		schema.methods.addRoles          = addRoles;
		schema.methods.roleSet           = roleSet;
		schema.methods.allRoles          = allRoles;
		schema.methods.setRoles          = setRoles;
		schema.index ({read:1});
		schema.index ({write:1});
		schema.index ({submit:1});
		schema.index ({watch:1});
	}
	if (indexes && _.isArray(indexes)) {
		_.each (indexes, function (ind) {
			schema.index (ind);
		});
	}
	
	return schema;
};
// -------------------------------------------------------------------------
//
// where there is no need to mess with the schema further, just go straight
// to making the model itself
//
// -------------------------------------------------------------------------
var generateModel = function (name, definition, indexes) {
	return mongoose.model (name, generateSchema (definition, indexes));
};

module.exports = {
	auditFields    : auditFields,
	accessFields   : accessFields,
	permissions    : permissions,
	hasPermission  : hasPermission,
	generateSchema : generateSchema,
	generateModel  : generateModel
};
