'use strict';
// =========================================================================
//
// Policies for descriptions
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'description');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/description/for/project/:projectId'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


