'use strict';

var mongoose = require ('mongoose');
var acl      = require ('acl');
var _        = require ('lodash');

acl          = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_', true));

// -------------------------------------------------------------------------
//
//
// -------------------------------------------------------------------------
var _allow = function (roles, resources, permissions, cb) {
	console.log ('Lets go do this:', roles, resources, permissions);
	// cb();
	// return;
	if (!roles || !resources || !permissions || roles.length === 0) {
		console.log ('something amiss attempting to set permissions');
		cb ();
	}
	acl.allow (roles, resources, permissions, cb);
};

// -------------------------------------------------------------------------
//
// pass in an object id and the permissions object {read:'', write:'', watch:''}
// this removes all permissions for this resource nad replaces them with
// this set of new ones
//
// cb: function (err)
//
// -------------------------------------------------------------------------
exports.setResourcePermissions = function (resourceId, permissions, cb) {
	var r = _.isArray (permissions.read) ? permissions.read : permissions.read.split (/[ ,]+/);
	var w = _.isArray (permissions.write) ? permissions.write : permissions.write.split (/[ ,]+/);
	var n = _.isArray (permissions.watch) ? permissions.watch : permissions.watch.split (/[ ,]+/);
	acl.removeResource (resourceId, function (err) {
		if (err) return cb (err);
		_allow (r, resourceId, 'read', function (err) {
			if (err) return cb (err);
			_allow (w, resourceId, 'write', function (err) {
				if (err) return cb (err);
				_allow (n, resourceId, 'watch', cb);
			});
		});
	});
};

// -------------------------------------------------------------------------
//
// set role permsisions on resources - all arrays if wanted
// roles, resources, permissions, cb
// cb: function (err)
//
// -------------------------------------------------------------------------
exports.setRolePermissions = acl.allow;
// -------------------------------------------------------------------------
//
// remove all given permissions from the given resources for the role
// role, resources, permissions, cb
// cb: function (err)
//
// -------------------------------------------------------------------------
exports.removeRolePermissions = acl.removeAllow;

// -------------------------------------------------------------------------
//
// add a set of roles for a user
// cb: function (err)
//
// -------------------------------------------------------------------------
exports.setUserRoles = function (userId, newroles, cb) {
	var userroles = acl.userRoles (userId, function (err, currentroles) {
		if (err) return cb (err);
		var addroles = _.difference (newroles, currentroles);
		var delroles = _.difference (currentroles, newroles);
		acl.addUserRoles (userId, addroles, function (err) {
			if (err) return cb (err);
			acl.removeUserRoles (userId, addroles, cb);
		});
	});
};

// -------------------------------------------------------------------------
//
// get the roles for a user
// user, cb
// cb: function (err, roles)
//
// -------------------------------------------------------------------------
exports.getUserRoles = acl.userRoles;
exports.removeUserRoles = acl.removeUserRoles;
// -------------------------------------------------------------------------
//
// get the users for a role. This will be useful for getting all the users
// to be notified, etc etc
// role, cb
// cb: function (err, users)
//
// -------------------------------------------------------------------------
exports.getRoleUsers = acl.roleUsers;

// -------------------------------------------------------------------------
//
// does the given user have this role?
// user, role, cb
// bd: function (err, boolean)
//
// -------------------------------------------------------------------------
exports.userHasRole = acl.hasRole;

// -------------------------------------------------------------------------
//
// get the set of permissions that a user has over a set of resources
//
// userid, [resources], cb
// cb: function (err, {resourceName: [permissions]})
//
// -------------------------------------------------------------------------
exports.userPermissions = acl.allowedPermissions;

// -------------------------------------------------------------------------
//
// check if a user has the supplied permissions to a resource
// returns true if ALL of the permissions are present
// userid, resource, [permissions], cb
// cb: function (err, boolean)
//
// -------------------------------------------------------------------------
exports.userHasPermission = acl.isAllowed;

// -------------------------------------------------------------------------
//
// pass in the set of roles to check against a resource. this would be a
// user's set of roles perhaps, or a set of roles over a project. returns
// true if the combination of rules meets the correct permissions
// role or [roles], resource, [permissions], cb
// cb: function(err, boolean)
//
// -------------------------------------------------------------------------
exports.rolesHavePermission = acl.areAnyRolesAllowed;

// -------------------------------------------------------------------------
//
// return an object of all resources this role/s has permissions for, each
// element being an array of the permissions
// roles, cb
// cb: function(err, {resourceName: [permissions]}
//
// -------------------------------------------------------------------------
exports.roleResrouces = acl.whatResources;
// -------------------------------------------------------------------------
//
// return an object of all resources this role/s has the given permissions
// for,
// roles, permissions, cb
// cb: function(err, resources}
//
// -------------------------------------------------------------------------
exports.roleResrouces = acl.whatResources;

// -------------------------------------------------------------------------
//
// remove roles or resources, typical callback
//
// -------------------------------------------------------------------------
exports.removeRole = acl.removeRole;
exports.removeResource = acl.removeResource;

