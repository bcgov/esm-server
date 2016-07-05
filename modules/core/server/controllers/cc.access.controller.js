'use strict';
// =========================================================================
//
// this controller deals with all functions relating to roles and permissions
// over all objects in the system
//
// internally the two most important things are adding permissions to an object
// and adding users to roles and creating roles
//
//
//
// =========================================================================

var mongoose   = require ('mongoose');
var Role       = mongoose.model ('_Role');
var Permission = mongoose.model ('_Permission');
var _          = require ('lodash');
var helpers    = require ('../controllers/cc.routes.controller');
var runPromise = helpers.runPromise;

var defaultResource = 'application';
var defaultContext  = 'application';
var defaultRole     = 'public';

// -------------------------------------------------------------------------
//
// helper functions
//
// -------------------------------------------------------------------------
var pluckPermissions = function (a) {
	return _.uniq (_.pluck (a, 'permission'));
};
var pivotPermissions = function (a) {
	var ret = {};
	a.map (function (p) {
		if (!ret[p.permission]) ret[p.permission] = [];
		if (p.role !== null) ret[p.permission].push (p.role);
	});
	return ret;
};
var indexPermissionRoles = function (a) {
	var ret = {role:{},permission:{}};
	a.map (function (row) {
		if (!ret.permission[row.permission]) ret.permission[row.permission] = {};
		if (!ret.role[row.role]) ret.role[row.role] = {};
		ret.permission[row.permission][row.role] = true;
		ret.role[row.role][row.permission] = true;
	});
	return ret;
};
var expandPermissions = function (p) {
	var ps = [];
	_.each (p.permissions, function (permission) {
		_.each (p.roles, function (role) {
			ps.push ({
				resource   : p.resource,
				permission : permission,
				role       : role
			});
		});
	});
	return ps;
};
var pluckRoles = function (a) {
	return _.uniq (a.map (function (r) {
		return r.role;
	}));
};
var pluckAppRoles = function (a) {
	return pluckRoles (a);
	// return _.uniq (a.map (function (r) {
	// 	return r.context + ':' + r.role;
	// }));
};
var pivotRoles = function (a) {
	var ret = {};
	a.map (function (p) {
		if (!ret[p.role]) ret[p.role] = [];
		if (p.user !== null) ret[p.role].push (p.user);
	});
	return ret;
};
var indexRoleUsers = function (a) {
	var ret = {role:{},user:{}};
	a.map (function (row) {
		if (!ret.user[row.user]) ret.user[row.user] = {};
		if (!ret.role[row.role]) ret.role[row.role] = {};
		ret.user[row.user][row.role] = true;
		ret.role[row.role][row.user] = true;
	});
	return ret;
};
var expandRoles = function (p) {
	var ps = [];
	_.each (p.roles, function (role) {
		_.each (p.users, function (user) {
			ps.push ({
				context : p.context,
				role    : role,
				user    : user
			});
		});
	});
	return ps;
};
var addPublicRole = function (a) {
	a.push ('public');
	return a;
};
var addAllRole = function (a) {
	a.push ('*');
	return a;
};
var ensureArray = function (val) {
	if (!val) return [];
	else if (_.isArray (val)) return val;
	else return [val];
};
var complete = function (reject, funct) {
	return function (err) {
		reject (new Error ('dbmodel.'+funct+': '+err.message));
	};
};
// -------------------------------------------------------------------------
//
// wrap the find in a proper promise for both types. Always returns an array
//
// -------------------------------------------------------------------------
var findPermissions = function (q) {
	return new Promise (function (resolve, reject) {
		Permission.find (q).then (resolve, complete (reject, 'findPermissions'));
	});
};
var findRoles = function (q) {
	return new Promise (function (resolve, reject) {
		Role.find (q).then (resolve, complete (reject, 'findRoles'));
	});
};
// -------------------------------------------------------------------------
//
// pass in a new thing and then make it and save it
//
// -------------------------------------------------------------------------
var createPermission = function (p) {
	return new Promise (function (resolve, reject) {
		// console.log ('creating new permission', p);
		(new Permission (p)).save ().then (resolve, complete (reject, 'createPermission'));
	});
};
var createRole = function (p) {
	return new Promise (function (resolve, reject) {
		(new Role (p)).save ().then (resolve, complete (reject, 'createRole'));
	});
};
// =========================================================================
//
// PERMISSIONS
//
// =========================================================================
// -------------------------------------------------------------------------
//
// Add a permission or role, but ONLY if it does not already exist
//
// -------------------------------------------------------------------------
var addPermission = function (p) {
	return new Promise (function (resolve, reject) {
		if (!p.permission) {
			reject ({ message: 'no permission defined in addPermission' });
		}
		else if (!p.resource) {
			reject ({ message: 'no resource defined in addPermission' });
		}
		else {
			findPermissions (p)
			.then (function (r) {
				// console.log ('returned r', r);
				return !r.length ? createPermission (p) : '';
			})
			.then (resolve, complete (reject, 'addPermission'));
		}
	});
};
var addPermissions = function (p) {
	p.permissions = ensureArray (p.permissions);
	p.roles = ensureArray (p.roles);
	return Promise.all (expandPermissions(p).map (function (v) {
		return addPermission (v);
	}));
};
exports.addPermission = addPermission;
exports.addPermissions = addPermissions;
// -------------------------------------------------------------------------
//
// remove a role from a permission for a resource
//
// -------------------------------------------------------------------------
var deletePermission = function (p) {
	return new Promise (function (resolve, reject) {
		if (!p.resource) {
			reject ({message:'no resource defined in deletePermission'});
		}
		else if (!p.permission) {
			reject ({message:'no permission defined in deletePermission'});
		}
		else if (typeof p.role === 'undefined') {
			reject ({message:'no role defined in deletePermission'});
		}
		else {
			Permission.remove (p).exec ().then (resolve, complete (reject, 'deletePermission'));
		}
	});
};
var deletePermissions = function (p) {
	p.permissions = ensureArray (p.permissions);
	p.roles = ensureArray (p.roles);
	return Promise.all (expandPermissions(p).map (function (v) {
		return deletePermission (v);
	}));
};
exports.deletePermissions = deletePermissions;
var deleteAllPermissions = function (p) {
	//
	// given a specific resource, delete all but the definitions
	//
	return new Promise (function (resolve, reject) {
		Permission.remove ({
			resource : p.resource,
			role     : { $ne : null }
		}).exec ().then (resolve, complete (reject, 'deleteAllPermissions'));
	});
};
exports.deleteAllPermissions = deleteAllPermissions;
// -------------------------------------------------------------------------
//
// force a set of roles for a permission on a resource
//
// -------------------------------------------------------------------------
var setPermissionRoles = function (p) {
	return new Promise (function (resolve, reject) {
		//
		// remove all roles from this permission
		//
		Permission.remove ({
			resource   : p.resource,
			permission : p.permision,
			role       : { $ne : null },
		}).exec ()
		.then (function () {
			return addPermissions ({
				resource : p .resource,
				permissions : [p.permission],
				roles : p.roles
			});
		})
		.then (resolve, complete (reject, 'setPermissionRoles'));
	});
};
exports.setPermissionRoles = setPermissionRoles;
// -------------------------------------------------------------------------
//
// set permissions on Object
//
// this takes a model in that HAS to be the result of the schema
// pre-processer. it will SET all supplied permissions, ignoring any missing
// ones. if any are the special read / write / delete ones, then it also
// applies those to the model listing type of permission that is used by
// dbmodel for purposes of filtering on collections
//
// in this input, p, the resource parameter is the actual resource model
// p : {
// 	resource: <model>
// 	permissions : {
// 		<permission>: [<roles>]
// 	}
// }
// -------------------------------------------------------------------------
var setObjectPermissionRoles = function (p) {
	var promisesPromises = [];
	// console.log (JSON.stringify (p.resource, null, 4));
	_.each (p.permissions, function (roles, permission) {
		promisesPromises.push (setPermissionRoles ({
			resource   : p.resource._id,
			permission : permission,
			roles      : roles
		}));
	});
	return Promise.all (promisesPromises).then (function () {
		//
		// this has to be done last because it prepends the role
		// with the context for listing
		//
		p.permissions.read = p.permissions.read || p.resource.read;
		p.permissions.write = p.permissions.write || p.resource.write;
		p.permissions.delete = p.permissions.delete || p.resource.delete;
		p.resource.setRoles (p.permissions);
		return p;
	});
};
exports.setObjectPermissionRoles = setObjectPermissionRoles;
// -------------------------------------------------------------------------
//
// Add a permission definition
//
// -------------------------------------------------------------------------
var addPermissionDefinition = function (p) {
	p.role = null;
	return addPermission (p);
};
var addPermissionDefinitions = function (o) {
	o.permissions = ensureArray (o.permissions);
	return Promise.all (o.permissions.map (function (permission) {
		return addPermission ({
			resource   : o.resource,
			permission : permission,
			role       : null
		});
	}));
};
// -------------------------------------------------------------------------
//
// remove a permission definition
//
// -------------------------------------------------------------------------
var deletePermissionDefinition = function (p) {
	p.role = null;
	return deletePermission (p);
};
var deletePermissionDefinitions = function (o) {
	o.permissions = ensureArray (o.permissions);
	return Promise.all (o.permissions.map (function (permission) {
		return deletePermission ({
			resource   : o.resource,
			permission : permission,
			role       : null
		});
	}));
};
// -------------------------------------------------------------------------
//
// get all rows from permissions for a resource
//
// -------------------------------------------------------------------------
var getPermissionsForResource = function (o) {
	return new Promise (function (resolve, reject) {
		if (!o.resource) {
			reject ({message:'no resource defined in getPermissionsForResource'});
		}
		else {
			findPermissions (o)
			.then (resolve, complete (reject, 'getPermissionsForResource'));
		}
	});
};
// -------------------------------------------------------------------------
//
// get a list of all the permission definitions for a resource
//
// -------------------------------------------------------------------------
var getPermissionList = function (o) {
	return new Promise (function (resolve, reject) {
		getPermissionsForResource ({
			resource   : o.resource,
			role       : null
		})
		.then (pluckPermissions)
		.then (resolve, complete (reject, 'getPermissionList'));
	});
};
exports.getPermissionList = getPermissionList;
// -------------------------------------------------------------------------
//
// get a list of all the permissions for a resource and all the roles
// attached to them
//
// -------------------------------------------------------------------------
var getPermissionRoles = function (o) {
	return new Promise (function (resolve, reject) {
		getPermissionsForResource ({
			resource   : o.resource
		})
		.then (pivotPermissions)
		.then (resolve, complete (reject, 'getPermissionRoles'));
	});
};
// -------------------------------------------------------------------------
//
// get the index of permissions to roles, both ways, for a resource
//
// -------------------------------------------------------------------------
var getPermissionRoleIndex = function (o) {
	return new Promise (function (resolve, reject) {
		getPermissionsForResource ({
			resource   : o.resource,
			role     : { $ne : null }
		})
		.then (indexPermissionRoles)
		.then (resolve, complete (reject, 'getPermissionRoleIndex'));
	});
};
exports.getPermissionRoleIndex = getPermissionRoleIndex;
// -------------------------------------------------------------------------
//
// update the table from a supplied index set. If the value is true, then
// set to true, if false, then delete
//
// -------------------------------------------------------------------------
var setPermissionRoleIndex = function (resource, index) {
	console.log ('here');
	return new Promise (function (resolve, reject) {
		var promiseArray = [];
		var modelroles = {read:[],write:[],delete:[]};
		_.each (index.permission, function (roles, permission) {
			_.each (roles, function (value, role) {
				if (value) {
					promiseArray.push (addPermission ({
						resource   : resource,
						permission : permission,
						role       : role
					}));
					if (modelroles[permission]) modelroles[permission].push (role);
				}
				else {
					promiseArray.push (deletePermission ({
						resource   : resource,
						permission : permission,
						role       : role
					}));
				}
			});
		});
		Promise.all (promiseArray)
		.then (function () {
			//
			// now set the read / write / delete on the resource
			// the schema name would be passed down in the index
			//
			var m = mongoose.model (index.schemaName);
			console.log ('updating ', index.schemaName, resource, JSON.stringify (modelroles));
			return m.update ({_id:resource}, modelroles).exec ();
		})
		.then (function () { return {ok:true};})
		.then (resolve, complete (reject, 'setPermissionRoleIndex'));
	});
};
exports.setPermissionRoleIndex = setPermissionRoleIndex;
// =========================================================================
//
// ROLES
//
// =========================================================================
// -------------------------------------------------------------------------
//
// Add a role or user, but ONLY if it does not already exist
//
// -------------------------------------------------------------------------
var addRole = function (p) {
	return new Promise (function (resolve, reject) {
		if (!p.role) {
			reject ({ message: 'no role defined in addRole' });
		}
		else if (!p.context) {
			reject ({ message: 'no context defined in addRole' });
		}
		else {
			if (p.context === defaultContext && p.context.lastIndexOf(defaultContext, 0) !== 0) {
				p.role = defaultContext+':'+p.role;
			}
			findRoles (p)
			.then (function (r) {
				// console.log ('returned r', r);
				return !r.length ? createRole (p) : '';
			})
			.then (resolve, complete (reject, 'addRole'));
		}
	});
};
var addRoles = function (p) {
	p.roles = ensureArray (p.roles);
	p.users = ensureArray (p.users);
	return Promise.all (expandRoles(p).map (function (v) {
		return addRole (v);
	}));
};
exports.addRoles = addRoles;
// -------------------------------------------------------------------------
//
// only add the role if it not already there, return true or false for this
// this is meant only for definitions, so where user == null
//
// -------------------------------------------------------------------------
var addRoleIfUnique = function (p) {
	p.user = null;
	if (p.context === defaultContext && p.context.lastIndexOf(defaultContext, 0) !== 0) {
		p.role = defaultContext+':'+p.role;
	}
	return new Promise (function (resolve, reject) {
		findRoles (p)
		.then (function (r) {
			return !r.length ? createRole (p) : false;
		})
		.then (function (r) {
			return (!r) ? {ok:false} : {ok:true};
		})
		.then (resolve, complete (reject, 'addRoleIfUnique'));
	});
};
exports.addRoleIfUnique = addRoleIfUnique;
// -------------------------------------------------------------------------
//
// remove a user from a role for a context
//
// -------------------------------------------------------------------------
var deleteRole = function (p) {
	return new Promise (function (resolve, reject) {
		if (!p.context) {
			reject ({message:'no context defined in deleteRole'});
		}
		else if (!p.role) {
			reject ({message:'no role defined in deleteRole'});
		}
		else if (typeof p.user === 'undefined') {
			reject ({message:'no user defined in deleteRole'});
		}
		else {
			Role.remove (p).exec ().then (resolve, complete (reject, 'deleteRole'));
		}
	});
};
var deleteRoles = function (p) {
	p.roles = ensureArray (p.roles);
	p.users = ensureArray (p.users);
	return Promise.all (expandRoles(p).map (function (v) {
		return deleteRole (v);
	}));
};
// -------------------------------------------------------------------------
//
// Add a role definition
//
// -------------------------------------------------------------------------
var addRoleDefinition = function (p) {
	p.user = null;
	return addRole (p);
};
exports.addRoleDefinition = addRoleDefinition;
var addRoleDefinitions = function (o) {
	o.roles = ensureArray (o.roles);
	console.log (o.context);
	console.log (o.owner);
	console.log (o.roles);
	return Promise.all (o.roles.map (function (role) {
		return addRole ({
			context   : o.context,
			role      : role,
			user      : null,
			owner     : o.owner
		});
	}));
};
exports.addRoleDefinitions = addRoleDefinitions;
var ensureAddRole = function (p) {
	return addRole (p).then (function () {
		return addRoleDefinition (p);
	});
};
// -------------------------------------------------------------------------
//
// remove a role definition
//
// -------------------------------------------------------------------------
var deleteRoleDefinition = function (p) {
	p.user = null;
	return deleteRole (p);
};
var deleteRoleDefinitions = function (o) {
	o.roles = ensureArray (o.roles);
	return Promise.all (o.roles.map (function (role) {
		return deleteRole ({
			context   : o.context,
			role : role,
			user       : null
		});
	}));
};
// -------------------------------------------------------------------------
//
// get all rows from roles for a context
//
// -------------------------------------------------------------------------
var getRolesForContext = function (o) {
	return new Promise (function (resolve, reject) {
		if (!o.context) {
			reject ({message:'no context defined in getRolesForContext'});
		}
		else {
			findRoles (o)
			.then (resolve, complete (reject, 'getRolesForContext'));
		}
	});
};
// -------------------------------------------------------------------------
//
// get a list of all the role definitions for a context
//
// -------------------------------------------------------------------------
var getRoleList = function (o) {
	var decorator = (o.context === defaultResource) ?  pluckAppRoles : pluckRoles;
	return new Promise (function (resolve, reject) {
		getRolesForContext ({
			context   : o.context,
			user       : null
		})
		.then (decorator)
		.then (resolve, complete (reject, 'getRoleList'));
	});
};
// -------------------------------------------------------------------------
//
// get a list of all the roles for a context and all the users
// attached to them
//
// -------------------------------------------------------------------------
var getRoleUsers = function (o) {
	return new Promise (function (resolve, reject) {
		getRolesForContext ({
			context   : o.context
		})
		.then (pivotRoles)
		.then (resolve, complete (reject, 'getRoleUsers'));
	});
};
// -------------------------------------------------------------------------
//
// get the index of users to roles, both ways, for a context
//
// -------------------------------------------------------------------------
var getRoleUserIndex = function (o) {
	return new Promise (function (resolve, reject) {
		getRolesForContext ({
			context   : o.context,
			user     : { $ne : null }
		})
		.then (indexRoleUsers)
		.then (resolve, complete (reject, 'getRoleUserIndex'));
	});
};
exports.getRoleUserIndex = getRoleUserIndex;
// -------------------------------------------------------------------------
//
// get the index of users to roles, both ways, for a context
//
// -------------------------------------------------------------------------
var setRoleUserIndex = function (context, index) {
	return new Promise (function (resolve, reject) {
		var promiseArray = [];
		_.each (index.user, function (roles, user) {
			_.each (roles, function (value, role) {
				if (value) {
					promiseArray.push (addRole ({
						context : context,
						user    : user,
						role    : role
					}));
				}
				else {
					promiseArray.push (deleteRole ({
						context : context,
						user    : user,
						role    : role
					}));
				}
			});
		});
		Promise.all (promiseArray)
		.then (function () { return {ok:true};})
		.then (resolve, complete (reject, 'setRoleUserIndex'));
	});
};
exports.setRoleUserIndex = setRoleUserIndex;
// =========================================================================
//
// Working stuff
//
// =========================================================================
// -------------------------------------------------------------------------
//
// list user roles within a specific context
//
// -------------------------------------------------------------------------
var getUserRoles = function (p) {
	// console.log (p.user);
	var decorator = (p.context === defaultResource) ?  pluckAppRoles : pluckRoles;
	if (p.user) {
		return getRolesForContext (p)
		.then (decorator)
		.then (addPublicRole)
		.then (addAllRole);
	}
	else {
		return Promise.resolve ([])
		.then (addPublicRole);
	}
};
exports.getUserRoles = getUserRoles;
// -------------------------------------------------------------------------
//
// get the user roles for the passed in context as well as the parent
// context
//
// -------------------------------------------------------------------------
var getAllUserRoles = function (p) {
	// console.log ('getting all user roles for user context: ',p);
	return new Promise (function (resolve, reject) {
		var listPromise;
		if (!p.user) {
			// console.log ('public only');
			//
			// no one, just public
			//
			listPromise = Promise.resolve ([])
			.then (addPublicRole);
		}
		else if (p.context === defaultResource) {
			// console.log ('public and all');
			listPromise = findRoles ({
				context : p.context,
				user    : p.user
			})
			.then (pluckAppRoles)
			.then (addPublicRole)
			.then (addAllRole);
		}
		else {
			// console.log ('public  and all');
			//
			// get this context as well as the parent (application)
			//
			var appRoles;
			listPromise = findRoles ({
				context : defaultResource,
				user    : p.user
			})
			.then (pluckAppRoles)
			.then (function (a) {
				appRoles = a;
				return findRoles ({
					context : p.context,
					user    : p.user
				});
			})
			.then (pluckRoles)
			.then (function (a) {
				return a.concat (appRoles);
			})
			.then (addPublicRole)
			.then (addAllRole);
		}
		listPromise.then (resolve, complete (reject, 'getAllUserRoles'));
	});
};
exports.getAllUserRoles = getAllUserRoles;

// -------------------------------------------------------------------------
//
// more complicated, get the entire set of permissions a user has on a
// resource within a context.
//
// -------------------------------------------------------------------------
var userPermissions = function (p) {
	// console.log (p.user);
	return new Promise (function (resolve, reject) {
		//
		// now that we have the set of roles for the user within this
		// context, we can apply those to the set of permissions for
		// the resource in question
		//
		getAllUserRoles (p)
		.then (function (roleSet) {
			//
			// add the splat because of course
			//
			// console.log ('roleSet = ', roleSet);
			return findPermissions ({
				resource : p.resource,
				role     : {$in : roleSet}
			});
		})
		.then (pluckPermissions)
		.then (resolve, complete (reject, 'userPermissions'));
	});
};
exports.userPermissions = userPermissions;

exports.routes = {
	addPermission : function (req, res) {
		return runPromise (res, addPermission (req.body));
	},
	addPermissions : function (req, res) {
		return runPromise (res, addPermissions (req.body));
	},
	deletePermission : function (req, res) {
		return runPromise (res, deletePermission (req.body));
	},
	deletePermissions : function (req, res) {
		return runPromise (res, deletePermissions (req.body));
	},
	addPermissionDefinition : function (req, res) {
		return runPromise (res, addPermissionDefinition (req.body));
	},
	addPermissionDefinitions : function (req, res) {
		return runPromise (res, addPermissionDefinitions (req.body));
	},
	deletePermissionDefinition : function (req, res) {
		return runPromise (res, deletePermissionDefinition (req.body));
	},
	deletePermissionDefinitions : function (req, res) {
		return runPromise (res, deletePermissionDefinitions (req.body));
	},
	getPermissionList : function (req, res) {
		return runPromise (res, getPermissionList ({resource:req.params.resource}));
	},
	getPermissionRoles : function (req, res) {
		return runPromise (res, getPermissionRoles ({resource:req.params.resource}));
	},
	getPermissionRoleIndex : function (req, res) {
		return runPromise (res, getPermissionRoleIndex ({resource:req.params.resource}));
	},
	setPermissionRoleIndex : function (req, res) {
		return runPromise (res, setPermissionRoleIndex (req.params.resource, req.body));
	},

	addRole : function (req, res) {
		return runPromise (res, addRole (req.body));
	},
	addRoles : function (req, res) {
		return runPromise (res, addRoles (req.body));
	},
	deleteRole : function (req, res) {
		return runPromise (res, deleteRole (req.body));
	},
	deleteRoles : function (req, res) {
		return runPromise (res, deleteRoles (req.body));
	},
	addRoleDefinition : function (req, res) {
		return runPromise (res, addRoleDefinition (req.body));
	},
	addRoleDefinitions : function (req, res) {
		return runPromise (res, addRoleDefinitions (req.body));
	},
	deleteRoleDefinition : function (req, res) {
		return runPromise (res, deleteRoleDefinition (req.body));
	},
	deleteRoleDefinitions : function (req, res) {
		return runPromise (res, deleteRoleDefinitions (req.body));
	},
	getRoleList : function (req, res) {
		return runPromise (res, getRoleList ({context:req.params.context}));
	},
	getRoleUsers : function (req, res) {
		return runPromise (res, getRoleUsers ({context:req.params.context}));
	},
	getRoleUserIndex : function (req, res) {
		return runPromise (res, getRoleUserIndex ({context:req.params.context}));
	},
	setRoleUserIndex : function (req, res) {
		return runPromise (res, setRoleUserIndex (req.params.context, req.body));
	},
	addRoleIfUnique : function (req, res) {
		return runPromise (res, addRoleIfUnique (req.body));
	},

	getUserRoles : function (req, res) {
		return runPromise (res, getUserRoles ({
			user    : req.params.username || (req.user ? req.user.username : undefined),
			context : req.params.context
		}));
	},
	getAllUserRoles : function (req, res) {
		return runPromise (res, getAllUserRoles ({
			user    : req.params.username || (req.user ? req.user.username : undefined),
			context : req.params.context
		}));
	},

	userPermissions : function (req, res) {
		return runPromise (res, userPermissions ({
			user     : req.params.username || (req.user ? req.user.username : undefined) ,
			resource : req.params.resource,
			context  : req.params.context
		}));
	},

	// -------------------------------------------------------------------------
	//
	// examine all the user accounts
	//
	// -------------------------------------------------------------------------
	allusers: function (req, res) {
		var User = mongoose.model ('User');
		return runPromise (res, Promise.resolve(User.find ({}).exec ()));
	},
	convertusers: function (req, res) {
		var User    = mongoose.model ('User');
		var Defaults = mongoose.model ('_Defaults');
		var Project = mongoose.model ('Project');
		var parray  = [];
		var defaultProjectRoles;
		var masterPromise = new Promise (function (resolve, reject) {
			//
			// add default application roles and permissions
			//
			Defaults.findOne ({
				resource : 'application',
				level    : 'global',
				type     : 'rolePermissions',
			})
			.exec ()
			.then (function (defaultSpec) {
				_.each (defaultSpec.defaults, function (roles, owner) {
					_.each (roles, function (perms, role) {
						parray.push (addRoleDefinition ({
							context : 'application',
							owner : owner,
							role : role
						}));
						_.each (perms, function (permission) {
							parray.push (addPermission ({
								resource : 'application',
								owner : owner,
								role : role,
								permission: permission
							}));
						});
					});
				});
				return Defaults.findOne ({
					resource : 'project',
					level    : 'global',
					type     : 'rolePermissions',
				}).exec ();
			})
			//
			// now get default project roles and permissions
			//
			.then (function (defaultProjectRoleSpec) {
				defaultProjectRoles = defaultProjectRoleSpec;
				return User.find ({}).exec ();
			})
			.then (function (users) {
				var part;
				var definitions = {};
				_.each (users, function (user) {
					user.oldroles = (user.roles.length > 0) ? user.roles : user.oldroles;
					user.roles    = [];
					_.each (user.oldroles, function (oldrole) {
						var p = {};
						if (oldrole === 'admin') {
							user.roles    = ['admin'];
						}
						else {
							if (oldrole === 'eao') {
								parray.push (addRole ({
									context : 'application',
									role    : 'eao',
									user    : user.username,
									owner   : 'application:sysadmin'
								}));
							}
							else if (oldrole === 'proponent') {
								parray.push (addRole ({
									context : 'application',
									role   : 'proponent',
									user    : user.username,
									owner   : 'application:sysadmin'
								}));
							}
							else if (oldrole.match (/:eao:/)) {
								part    = oldrole.split (':eao:');
								parray.push (addRole ({
									context : part[0],
									role   : 'eao-'+part[1],
									user    : user.username
								}));
							}
							else if (oldrole.match (/:pro:/)) {
								part    = oldrole.split (':pro:');
								parray.push (addRole ({
									context :  part[0],
									role   : 'pro-'+part[1],
									user    : user.username
								}));
							}
						}
						parray.push (user.save ());
					});
				});
				return Promise.all (parray);
			})
			.then (function () {
				return Project.find ({}).exec ()
				.then (function (projects) {
					var parray = [];
					var definitions = {};
					_.each (projects, function (project) {
						//
						// add all the default project roles and permissions
						//
						_.each (defaultProjectRoles.defaults, function (roles, owner) {
							_.each (roles, function (perms, role) {
								parray.push (addRoleDefinition ({
									context : project.code,
									owner : owner,
									role : role
								}));
								_.each (perms, function (permission) {
									parray.push (addPermission ({
										resource : project._id,
										owner : owner,
										role : role,
										permission: permission
									}));
								});
							});
						});
						project.roles = [];
						project.setRoles ({
							read   : ['eao-admin', 'pro-admin', 'eao-member', 'pro-member'],
							write  : ['eao-admin', 'pro-admin'],
							delete : ['eao-admin', 'pro-admin'],
						});
						parray.push (project.save());
					});
				});
			})
			.then (function () {
				return Promise.all (parray);
			})
			.then (resolve, complete (reject, 'convertusers'));
		});
		return runPromise (res, masterPromise);
	},
};
