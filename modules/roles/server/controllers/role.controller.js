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

// =========================================================================
//
// these all service API routes
//
// =========================================================================
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
var getUsersForRole = function (code) {
	// console.log (code);
	return new Promise (function (resolve, reject) {
		Role.findOne ({ code: code },{users:1, code:1})
		.populate('users', 'username displayName _id')
		.exec()
		.then (resolve, reject);
	});
};
var getRolesInProject = function (project) {
	return new Promise (function (resolve, reject) {
		resolve (project.roles);
	});
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
var getProjectsWithRole = function (code) {
	return new Promise (function (resolve, reject) {
		Role.findOne ({ code: code },{projects:1, code:1})
		.populate('projects', 'code name description _id')
		.exec()
		.then (resolve, reject);
	});
};
var getSystemRoles = function () {
	return Role.find ({isSystem: true}).exec();
};


// =========================================================================
//
// These are more esoteric
//
// =========================================================================
// -------------------------------------------------------------------------
//
// Helper. This either returns the existing role record, or a new one with
// the code set
//
// -------------------------------------------------------------------------
var findRole = function (code) {
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
// -------------------------------------------------------------------------
//
// same logic as in the role schema
//
// -------------------------------------------------------------------------
var generateCode = function (projectCode, orgCode, roleCode) {
	var a = [];
	if (projectCode) a.push (projectCode);
	if (orgCode) a.push (orgCode);
	if (roleCode) a.push (roleCode);
	return a.join (':');
};
// -------------------------------------------------------------------------
//
// this should do everything with users and roles. expecting to be passed in
// an object like this one:
// {
// 	method: 'add', 'set', 'remove'
// 	users: an array of users effected, all schema objects
// 	roles: an array of role codes effected, all strings
// }
//
// promise resolves to the list of saved users
//
// -------------------------------------------------------------------------
var userRoles = function (data) {
	return new Promise (function (resolve, reject) {
		//
		// get all the roles
		//
		Promise.all (data.roles, function (code) {
			return findRole (code);
		})
		.then (function (rolesarray) {
			//
			// make an array of just user ids and add all of them
			// to each role using the correct method
			//
			var idArray = data.users.map (function (u) {
				return u._id.toString ();
			});
			return Promise.all (rolesarray, function (role) {
				role.modObject (data.method, 'users', idArray);
				return role.save ();
			});
		})
		.then (function (rolesalldone) {
			//
			// now we can deal with the other direction. we already
			// have all the user schema docs, so let's plow
			// through those and do the same
			//
			return Promise.all (data.users, function (user) {
				user.modRoles (data.method, data.roles);
				return user.save ();
			});
		})
		.then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// this should do everything with all other objects but users and roles.
// expecting to be passed in an object like this one:
// {
// 	method: 'add', 'set', 'remove'
// 	objects: an array of objects effected, all schema objects
//  type : the type of object, but in plural form, all lower case,
//         pretty much the plural of the schema name, so 'projects'
// 	permissions: a permission object which looks like this:
//	{
//		read   : [roles],
//		write  : [roles],
//		submit : [roles],
//		watch  : [roles]
//	}
// }
//
// promise resolves to the list of saved objects
//
// -------------------------------------------------------------------------
var objectRoles = function (data) {
	return new Promise (function (resolve, reject) {
		//
		// flatten out the roles into a discreet list
		//
		var allRoles = _.union (data.permissions.read, data.permissions.write, data.permissions.submit, data.permissions.watch);
		//
		// get all the roles
		//
		Promise.all (allRoles, function (code) {
			return findRole (code);
		})
		.then (function (rolesarray) {
			//
			// make an array of just object ids and add all of them
			// to each role using the correct method
			//
			var idArray = data.objects.map (function (u) {
				return u._id.toString ();
			});
			return Promise.all (rolesarray, function (role) {
				role.modObject (data.method, data.type, idArray);
				return role.save ();
			});
		})
		.then (function (rolesalldone) {
			//
			// now we can deal with the other direction. we already
			// have all the object schema docs, so let's plow
			// through those and do the same, but add the permissions
			//
			return Promise.all (data.objects, function (object) {
				object.modRoles (data.method, data.permissions);
				return object.save ();
			});
		})
		.then (resolve, reject);
	});
};

module.exports = {
	//
	// servicing api routes
	//
	newRole : newRole,
	getRole : getRole,
	getUsersForRole : getUsersForRole,
	getRolesInProject : getRolesInProject,
	getUsersInRolesInProject:getUsersInRolesInProject,
	getProjectsWithRole:getProjectsWithRole,
	getSystemRoles:getSystemRoles,
	//
	// used by the back end to set and adjust roles in both directions
	//
	objectRoles:objectRoles,
	userRoles:userRoles,
};

	// addUserRole : addUserRole,
	// addObjectRole : addObjectRole,
	// addUserRoles : addUserRoles,
	// addObjectRoles : addObjectRole,
	// addObjectsRole : addObjectRole,
	// addObjectRolesFromSpec : addObjectRolesFromSpec,
	// addRolesToConfigObject : addRolesToConfigObject,
	// mergeObjectRoles:mergeObjectRoles,
	// setObjectRoles:setObjectRoles,
	// getNewOrExistingRole : getNewOrExistingRole,

// // -------------------------------------------------------------------------
// //
// // Add one role to the user. this works in both directions as it
// //
// // -------------------------------------------------------------------------
// var addUserRole = function (user, code) {
// 	// console.log ('+ adding user role ', code, user.username);
// 	return new Promise (function (resolve, reject) {
// 		getNewOrExistingRole (code)
// 		.then (function (role) {
// 			// console.log ('set the user role on role and save', role.code);
// 			role.setUserRole (user._id.toString());
// 			return role.save ();
// 		})
// 		.then (function (role) {
// 			// console.log ('set the user role on user and save');
// 			user.setUserRole (code);
// 			return user.save ();
// 		})
// 		.then (resolve, reject);
// 	});
// };
// var addUserRoles = function (user, codes) {
// 	return new Promise (function (resolve, reject) {
// 		Promise.all (codes.map (function (code) {
// 			return addUserRole (user, code);
// 		})).then (resolve, reject);
// 	});
// };
// var addObjectRole = function (objectType, objectId, code) {
// 	// console.log ('adding object role ',objectType, objectId, code);
// 	return new Promise (function (resolve, reject) {
// 		getNewOrExistingRole (code)
// 		.then (function (role) {
// 			// console.log ('++ adding object role ',objectType, objectId, role);
// 			role.setObjectRole (objectType, objectId.toString());
// 			return role.save ();
// 		})
// 		.then (resolve, reject);
// 	});
// };
// var addObjectRoles = function (objectType, objectId, codes) {
// 	// console.log ('adding object codes ',codes);
// 	// console.log ('for type ',objectType);
// 	// console.log ('aand id ',objectId);
// 	return Promise.all (codes.map (function (code) {
// 		return addObjectRole (objectType, objectId, code);
// 	}));
// };
// var addObjectsRole = function (objectType, objectIds, code) {
// 	return new Promise (function (resolve, reject) {
// 		getNewOrExistingRole (code)
// 		.then (function (role) {
// 			role.setObjectsRole (objectType, objectIds);
// 			return role.save ();
// 		})
// 		.then (resolve, reject);
// 	});
// };
// // -------------------------------------------------------------------------
// //
// // this works for db objects that utilize the access control
// // projectCode is passed in because some base roles need project:
// // replaced with the project code
// //
// // spec looks like this:
// // {
// // 	read : [role, role]
// // 	write: [role]
// // 	etc
// // }
// //
// // -------------------------------------------------------------------------
// var addObjectRolesFromSpec = function (objectType, objectId, spec) {
// 	var codes = [];
// 	_.each (spec, function (a) { codes = codes.concat (a); });
// 	codes = _.uniq (codes);
// 	// console.log ('addObjectRolesFromSpec codes ',codes);
// 	// console.log ('addObjectRolesFromSpec type ',objectType);
// 	// console.log ('addObjectRolesFromSpec id ',objectId);
// 	return addObjectRoles (objectType, objectId, codes);
// };
// var addRolesToConfigObject = function (dbobject, objectType, spec) {
// 	// console.log ('objectType: ', objectType);
// 	// console.log ('dbobject: ', dbobject);
// 	var projectCode = (objectType === 'projects') ? dbobject.code : dbobject.projectCode;
// 	// console.log ('projectCode: ', projectCode);
// 	_.each (spec, function (a, i) {
// 		spec[i] = a.map (function (r) {return r.replace ('project:', projectCode+':');});
// 	});
// 	// console.log ('spec: ', spec);
// 	dbobject.addRoles (spec);
// 	return addObjectRolesFromSpec (objectType, dbobject._id, spec);
// };
// // -------------------------------------------------------------------------
// //
// // OK, here's one that may be more useful.
// // given an object of some sort, upon which we apply roles, so a dbobject
// // with roles, and given the role spec that we wish to apply to it,
// // absolutely, just set the roles in the object itself (no save), and
// // then update the roles with the new object id for the thing
// //
// // -------------------------------------------------------------------------
// var setObjectRoles = function (dbobject, object, roleSpec) {
// 	object.setRoles (roleSpec);
// 	return addObjectRoles (dbobject.plural, object._id, object.roles);
// };
// // -------------------------------------------------------------------------
// //
// // and a merge of the same type
// //
// // -------------------------------------------------------------------------
// var mergeObjectRoles = function (dbobject, roleSpec) {
// 	dbobject.addRoles (roleSpec);
// 	return addObjectRoles (dbobject.plural, dbobject._id, dbobject.roles);
// };


// var addUserRole = function (user, code) {
// 	// console.log ('+ adding user role ', code, user.username);
// 	return new Promise (function (resolve, reject) {
// 		getNewOrExistingRole (code)
// 		.then (function (role) {
// 			// console.log ('set the user role on role and save', role.code);
// 			role.setUserRole (user._id.toString());
// 			return role.save ();
// 		})
// 		.then (function (role) {
// 			// console.log ('set the user role on user and save');
// 			user.setUserRole (code);
// 			return user.save ();
// 		})
// 		.then (resolve, reject);
// 	});
// };
// var addUserRoles = function (user, codes) {
// 	return new Promise (function (resolve, reject) {
// 		Promise.all (codes.map (function (code) {
// 			return addUserRole (user, code);
// 		})).then (resolve, reject);
// 	});
// };
