'use strict';
// =========================================================================
//
// Controller for roles
//
// =========================================================================
var path     = require('path');
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var mongoose = require ('mongoose');
var Role     = mongoose.model ('Role');
var _        = require ('lodash');

var getRole = function (code) {
	return new Promise (function (resolve, reject) {
		Role.findOne ({ code: code }).exec().then (resolve, reject);
	});
};
var newRole = function (code) {
	return new Promise (function (resolve, reject) {
		resolve ( new Role ({ code: code }) );
	});
};
var getNewOrExistingRole = function (code) {
	return new Promise (function (resolve, reject) {
		getRole (code)
		.then (function (role) {
			if (!role) {
				return newRole (code);
			}
			else {
				return role;
			}
		})
		.then (resolve, reject);
	});
};
var addUserRole = function (user, code) {
	// console.log ('+ adding user role ', code, user.username);
	return new Promise (function (resolve, reject) {
		getNewOrExistingRole (code)
		.then (function (role) {
			// console.log ('set the user role on role and save', role.code);
			role.setUserRole (user._id.toString());
			return role.save ();
		})
		.then (function (role) {
			// console.log ('set the user role on user and save');
			user.setUserRole (code);
			return user.save ();
		})
		.then (resolve, reject);
	});
};
var addObjectRole = function (objectType, objectId, code) {
	// console.log ('adding object role ',objectType, objectId, code);
	return new Promise (function (resolve, reject) {
		getNewOrExistingRole (code)
		.then (function (role) {
			// console.log ('++ adding object role ',objectType, objectId, role);
			role.setObjectRole (objectType, objectId.toString());
			return role.save ();
		})
		.then (resolve, reject);
	});
};
var addUserRoles = function (user, codes) {
	return new Promise (function (resolve, reject) {
		Promise.all (codes.map (function (code) {
			return addUserRole (user, code);
		})).then (resolve, reject);
	});
};
var addObjectRoles = function (objectType, objectId, codes) {
	// console.log ('adding object codes ',codes);
	// console.log ('for type ',objectType);
	// console.log ('aand id ',objectId);
	return Promise.all (codes.map (function (code) {
		return addObjectRole (objectType, objectId, code);
	}));
};
var addObjectsRole = function (objectType, objectIds, code) {
	return new Promise (function (resolve, reject) {
		getNewOrExistingRole (code)
		.then (function (role) {
			role.setObjectsRole (objectType, objectIds);
			return role.save ();
		})
		.then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// this works for db objects that utilize the access control
// projectCode is passed in because some base roles need project:
// replaced with the project code
//
// spec looks like this:
// {
// 	read : [role, role]
// 	write: [role]
// 	etc
// }
//
// -------------------------------------------------------------------------
var addObjectRolesFromSpec = function (objectType, objectId, spec) {
	var codes = [];
	_.each (spec, function (a) { codes = codes.concat (a); });
	codes = _.uniq (codes);
	// console.log ('addObjectRolesFromSpec codes ',codes);
	// console.log ('addObjectRolesFromSpec type ',objectType);
	// console.log ('addObjectRolesFromSpec id ',objectId);
	return addObjectRoles (objectType, objectId, codes);
};
var addRolesToConfigObject = function (dbobject, objectType, spec) {
	// console.log ('objectType: ', objectType);
	// console.log ('dbobject: ', dbobject);
	var projectCode = (objectType === 'projects') ? dbobject.code : dbobject.projectCode;
	// console.log ('projectCode: ', projectCode);
	_.each (spec, function (a, i) {
		spec[i] = a.map (function (r) {return r.replace ('project:', projectCode+':');});
	});
	// console.log ('spec: ', spec);
	dbobject.addRoles (spec);
	return addObjectRolesFromSpec (objectType, dbobject._id, spec);
};
// -------------------------------------------------------------------------
//
// OK, here's one that may be more useful.
// given an object of some sort, upon which we apply roles, so a dbobject
// with roles, and given the role spec that we wish to apply to it,
// absolutely, just set the roles in the object itself (no save), and
// then update the roles with the new object id for the thing
//
// -------------------------------------------------------------------------
var setObjectRoles = function (dbobject, object, roleSpec) {
	object.setRoles (roleSpec);
	return addObjectRoles (dbobject.plural, object._id, object.roles);
};
// -------------------------------------------------------------------------
//
// and a merge of the same type
//
// -------------------------------------------------------------------------
var mergeObjectRoles = function (dbobject, roleSpec) {
	dbobject.addRoles (roleSpec);
	return addObjectRoles (dbobject.plural, dbobject._id, dbobject.roles);
};
// -------------------------------------------------------------------------
//
// get all user in a role, just username, and displayName, and id
//
// -------------------------------------------------------------------------
var getUsersForRole = function (code) {
	// console.log (code);
	return new Promise (function (resolve, reject) {
		Role.findOne ({ code: code },{users:1, code:1})
		.populate('users', 'username displayName _id')
		.exec()
		.then (resolve, reject);
	});
};
var getUsersForRoleRoute = function (req, res) {
	getUsersForRole (req.params.role)
	.then (helpers.success(res), helpers.failure(res));
};

var getRolesInProject = function (project) {
	return new Promise (function (resolve, reject) {
		resolve (project.roles);
	});
};
var getRolesInProjectRoute = function (req, res) {
	getRolesInProject (req.Project)
	.then (helpers.success(res), helpers.failure(res));
};

var getUsersInRolesInProject = function (project) {
	return new Promise (function (resolve, reject) {
		var a = project.roles.map (function (role) {
			return getUsersForRole (role);
		});
		Promise.all (a)
		.then (function (newa) {
			var ret = {};
			for (var i=0; i<project.roles.length; i++) {
				var role = project.roles[i];
				var result = (newa[i] && newa[i].users && newa[i].users.length) ? newa[i].users : [];
				// console.log ('role = ', role);
				// console.log ('result = ', result);
				ret[role] = result;
			}
			// console.log ('return', ret);
			return ret;
		})
		.then (resolve, reject);
	});
};
var getUsersInRolesInProjectRoute = function (req, res) {
	getUsersInRolesInProject (req.Project)
	.then (helpers.success(res), helpers.failure(res));
};
var getProjectsWithRole = function (code) {
	return new Promise (function (resolve, reject) {
		Role.findOne ({ code: code },{projects:1, code:1})
		.populate('projects', 'code name description _id')
		.exec()
		.then (resolve, reject);
	});
};
var getProjectsWithRoleRoute = function (req, res) {
	getProjectsWithRole (req.params.role)
	.then (helpers.success(res), helpers.failure(res));
};

var addRoleRoute = function (req, res) {
	newRole (req.params.role)
	.then (function (role) {
		role.set (req.body);
		return role.save ();
	})
	.then (helpers.success(res), helpers.failure(res));
};
var updateRoleRoute = function (req, res) {
	getRole (req.params.role)
	.then (function (role) {
		role.set (req.body);
		return role.save ();
	})
	.then (helpers.success(res), helpers.failure(res));
};
var getRoleRoute = function (req, res) {
	getRole (req.params.role)
	.then (helpers.success(res), helpers.failure(res));
};
var getSystemRoles = function () {
	return Role.find ({isSystem: true}).exec();
};
var getSystemRolesRoute = function (req, res) {
	getSystemRoles ()
	.then (helpers.success(res), helpers.failure(res));
};

module.exports = {
	getRole : getRole,
	newRole : newRole,
	getNewOrExistingRole : getNewOrExistingRole,
	addUserRole : addUserRole,
	addObjectRole : addObjectRole,
	addUserRoles : addUserRoles,
	addObjectRoles : addObjectRole,
	addObjectsRole : addObjectRole,
	addObjectRolesFromSpec : addObjectRolesFromSpec,
	addRolesToConfigObject : addRolesToConfigObject,
	getUsersForRole : getUsersForRole,
	getUsersForRoleRoute : getUsersForRoleRoute,
	getRolesInProjectRoute:getRolesInProjectRoute,
	getUsersInRolesInProjectRoute:getUsersInRolesInProjectRoute,
	getProjectsWithRole:getProjectsWithRole,
	getProjectsWithRoleRoute:getProjectsWithRoleRoute,
	addRoleRoute:addRoleRoute,
	updateRoleRoute:updateRoleRoute,
	getRoleRoute:getRoleRoute,
	getSystemRolesRoute:getSystemRolesRoute,
	getSystemRoles:getSystemRoles,
	mergeObjectRoles:mergeObjectRoles,
	setObjectRoles:setObjectRoles
};

