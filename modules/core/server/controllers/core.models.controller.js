'use strict';

var _ = require ('lodash');

// -------------------------------------------------------------------------
//
// things to do with setting audit fields
//
// -------------------------------------------------------------------------
exports.auditFields = {
	dateAdded   : { type: Date },
	dateUpdated : { type: Date },
	addedBy     : { type: 'ObjectId', ref:'User' },
	updatedBy   : { type: 'ObjectId', ref:'User' }
};

exports.auditSaveFunction = function (next) {
	// if (mongoose.user) this.updatedBy = mongoose.user._id;
	// this.dateUpdated = Date.now;
	// if ( !this.dateAdded ) {
	// 	this.dateAdded = this.dateUpdated;
	// 	this.addedBy   = this.updatedBy;
	// }
	// next();
};

// -------------------------------------------------------------------------
//
// things to do with handling access stuff
//
// -------------------------------------------------------------------------
exports.accessFields = {
	read  : [ {type:String} ],
	write : [ {type:String} ],
	submit: [ {type:String} ],
	watch : [ {type:String} ]
};

exports.permissions = function (userRoles) {
	return {
		read   : ( (_.intersection (userRoles, this.read)).length > 0),
		write  : ( (_.intersection (userRoles, this.write)).length > 0),
		submit : ( (_.intersection (userRoles, this.submit)).length > 0),
		watch  : ( (_.intersection (userRoles, this.watch)).length > 0)
	};
};

exports.hasPermission = function (user, permission) {
	var userRoles = (user) ? user.roles : [];
	userRoles.push ('public');
	if (_.indexOf (userRoles, 'admin') >= 0) return true;
	var permissions = this.permissions (userRoles);
	return (permissions[permission]) ? true : false;
};

