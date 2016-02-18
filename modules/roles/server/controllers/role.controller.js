'use strict';
// =========================================================================
//
// Controller for roles
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var _ = require ('lodash');
// var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
// var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Role     = mongoose.model ('Role');
// var userController = require(path.resolve('./modules/users/server/controllers/admin.server.controller'));

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
	return new Promise (function (resolve, reject) {
		getNewOrExistingRole (code)
		.then (function (role) {
			role.setUserRole (user._id);
			return role.save ();
		})
		.then (function (role) {
			user.setUserRole (code);
			return user.save ();
		})
		.then (resolve, reject);
	});
};
var addObjectRole = function (objectType, objectId, code) {
	console.log ('adding object role ',objectType, objectId, code);
	return new Promise (function (resolve, reject) {
		getNewOrExistingRole (code)
		.then (function (role) {
			console.log ('++ adding object role ',objectType, objectId, role);
			role.setObjectRole (objectType, objectId);
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
	console.log ('adding object codes ',codes);
	console.log ('for type ',objectType);
	console.log ('aand id ',objectId);
	return new Promise (function (resolve, reject) {
		Promise.all (codes.map (function (code) {
			return addObjectRole (objectType, objectId, code);
		})).then (resolve, reject);
	});
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
	console.log ('addObjectRolesFromSpec codes ',codes);
	console.log ('addObjectRolesFromSpec type ',objectType);
	console.log ('addObjectRolesFromSpec id ',objectId);
	return addObjectRoles (objectType, objectId, codes);
};
var addRolesToConfigObject = function (dbobject, objectType, spec) {
	console.log ('objectType: ', objectType);
	console.log ('dbobject: ', dbobject);
	var projectCode = (objectType === 'projects') ? dbobject.code : dbobject.projectCode;
	console.log ('projectCode: ', projectCode);
	_.each (spec, function (a, i) {
		spec[i] = a.map (function (r) {return r.replace ('project:', projectCode+':');});
	});
	console.log ('spec: ', spec);
	dbobject.addRoles (spec);
	return addObjectRolesFromSpec (objectType, dbobject._id, spec);
};

module.exports = {
	getRole : getRole,
	newRole : newRole,
	getNewOrExistingRole : getNewOrExistingRole,
	addUserRole : addUserRole,
	addObjectRole : addObjectRole,
	addUserRoles : addUserRole,
	addObjectRoles : addObjectRole,
	addObjectsRole : addObjectRole,
	addObjectRolesFromSpec : addObjectRolesFromSpec,
	addRolesToConfigObject : addRolesToConfigObject
};


// // -------------------------------------------------------------------------
// //
// // just save the role returning a promise
// //
// // -------------------------------------------------------------------------
// var saveRole = function (role) {
// 	return new Promise (function (resolve, reject) {
// 		role.save ().then (resolve, reject);
// 	});
// };
// // -------------------------------------------------------------------------
// //
// // get roles (return promise)
// //
// // -------------------------------------------------------------------------
// var getRoles = function (search) {
// 	return new Promise (function (resolve, reject) {
// 		Role.find (search).exec().then (resolve, reject);
// 	});
// };
// // -------------------------------------------------------------------------
// //
// // get project or stream roles
// //
// // -------------------------------------------------------------------------
// var getStreamRoles      = function (streamId) { return getRoles ({stream: streamId}); };
// var getProjectRoles     = function (projectId) { return getRoles ({project: projectId}); };
// // -------------------------------------------------------------------------
// //
// // copy stream roles into a project making new project roles
// // this is where naming converntion matters, to make project roles work
// // we will prefix them all with the project code. this would also mean that
// // if any objects contain this role, their names need to be changed to the
// // new name, that will hopefully get done elsewhere
// //
// // -------------------------------------------------------------------------
// var copyStreamRolesToProject = function (streamId, projectId, projectCode) {
// 	return new Promise (function (resolve, reject) {
// 		getStreamRoles (streamId)
// 		.then (function (models) {
// 			//
// 			// make an array of role save promises
// 			//
// 			return Promise.all (models.map (function (model) {
// 				var role = model.toObject ();
// 				delete role._id ;
// 				role         = new Role (role);
// 				role.project = projectId;
// 				role.stream  = null;
// 				role.code    = projectCode+':'+role.code;
// 				return saveRole (role);
// 			}));
// 		})
// 		.then (resolve, reject);
// 	});
// };
// // -------------------------------------------------------------------------
// //
// // add a user to a role or group (this calls add role to user)
// //
// // -------------------------------------------------------------------------
// var addUserToRole = function (req, res) {
// 	userController.addUserRole (req.model, req.Role)
// 	.then (function (m) {
// 		helpers.sendData (res, req.Role);
// 	})
// 	.catch (function (err) {
// 		helpers.sendError (res, err);
// 	});
// };

// var crud = new CRUD (Role);
// module.exports = {
// 	// -------------------------------------------------------------------------
// 	//
// 	// Basic CRUD
// 	//
// 	// -------------------------------------------------------------------------
// 	new       : crud.new    (),
// 	create    : crud.create (),
// 	read      : crud.read   (),
// 	update    : crud.update (),
// 	delete    : crud.delete (),
// 	list      : crud.list   (),
// 	getObject : crud.getObject   (),
// 	// -------------------------------------------------------------------------
// 	//
// 	// new stuff
// 	//
// 	// -------------------------------------------------------------------------
// 	saveRole                 : saveRole,
// 	getRoles                 : getRoles,
// 	getStreamRoles           : getStreamRoles,
// 	getProjectRoles          : getProjectRoles,
// 	copyStreamRolesToProject : copyStreamRolesToProject,
// 	addUserToRole            : addUserToRole
// };
