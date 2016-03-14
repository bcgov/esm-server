'use strict';
// =========================================================================
//
// Policies for irs
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'ir');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/ir/for/project/:projectId'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


