'use strict';
// =========================================================================
//
// Policies for core routes
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setPathPermissions (acl, [
		[ '', 'admin', '/api/db/modify']
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


