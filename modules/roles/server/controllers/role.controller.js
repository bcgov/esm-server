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
var getRole = function (search) {
	return new Promise (function (resolve, reject) {
		Role.find (search).exec().then (resolve, reject);
	});
};



var crud = new CRUD (Role);
// -------------------------------------------------------------------------
//
// Basic CRUD
//
// -------------------------------------------------------------------------
exports.new    = crud.new    ();
exports.create = crud.create ();
exports.read   = crud.read   ();
exports.update = crud.update ();
exports.delete = crud.delete ();
exports.list   = crud.list   ();
exports.getObject   = crud.getObject   ();

// exports.getRolesForProject = function (req, res) {
// 	if (!helpers.userCan (req.user, 'read', req.Project)) {
// 		return helpers.sendErrorMessage (res, "You do not have access to this project")
// 	}
// 	getRole ({
// 		project: req.Project._id,
// 	})
// 	.then (helpers.successFunction (res))
// 	.catch (helpers.errorFunction (res));
// };
