'use strict';
// =========================================================================
//
// Controller for roles
//
// =========================================================================
var path     = require('path');
var mongoose = require ('mongoose');
var helpers  = require (path.resolve('./modules/core/server/controllers/core.helpers.controller'));
var CRUD     = require (path.resolve('./modules/core/server/controllers/core.crud.controller'));
var Role     = mongoose.model ('Role');
var userController = require(path.resolve('./modules/users/server/controllers/admin.server.controller'));


// -------------------------------------------------------------------------
//
// just save the role returning a promise
//
// -------------------------------------------------------------------------
var saveRole = function (role) {
	return new Promise (function (resolve, reject) {
		role.save ().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// get roles (return promise)
//
// -------------------------------------------------------------------------
var getRoles = function (search) {
	return new Promise (function (resolve, reject) {
		Role.find (search).exec().then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// get project or stream roles
//
// -------------------------------------------------------------------------
var getStreamRoles      = function (streamId) { return getRoles ({stream: streamId}); };
var getProjectRoles     = function (projectId) { return getRoles ({project: projectId}); };
// -------------------------------------------------------------------------
//
// copy stream roles into a project making new project roles
// this is where naming converntion matters, to make project roles work
// we will prefix them all with the project code. this would also mean that
// if any objects contain this role, their names need to be changed to the
// new name, that will hopefully get done elsewhere
//
// -------------------------------------------------------------------------
var copyStreamRolesToProject = function (streamId, projectId, projectCode) {
	return new Promise (function (resolve, reject) {
		getStreamRoles (streamId)
		.then (function (models) {
			//
			// make an array of role save promises
			//
			return Promise.all (models.map (function (model) {
				var role = model.toObject ();
				delete role._id ;
				role         = new Role (role);
				role.project = projectId;
				role.stream  = null;
				role.code    = projectCode+':'+role.code;
				return saveRole (role);
			}));
		})
		.then (resolve, reject);
	});
};
// -------------------------------------------------------------------------
//
// add a user to a role or group (this calls add role to user)
//
// -------------------------------------------------------------------------
var addUserToRole = function (req, res) {
	userController.addUserRole (req.model, req.Role)
	.then (function (m) {
		helpers.sendData (res, req.Role);
	})
	.catch (function (err) {
		helpers.sendError (res, err);
	});
};

var crud = new CRUD (Role);
module.exports = {
	// -------------------------------------------------------------------------
	//
	// Basic CRUD
	//
	// -------------------------------------------------------------------------
	new       : crud.new    (),
	create    : crud.create (),
	read      : crud.read   (),
	update    : crud.update (),
	delete    : crud.delete (),
	list      : crud.list   (),
	getObject : crud.getObject   (),
	// -------------------------------------------------------------------------
	//
	// new stuff
	//
	// -------------------------------------------------------------------------
	saveRole                 : saveRole,
	getRoles                 : getRoles,
	getStreamRoles           : getStreamRoles,
	getProjectRoles          : getProjectRoles,
	copyStreamRolesToProject : copyStreamRolesToProject,
	addUserToRole            : addUserToRole
};
