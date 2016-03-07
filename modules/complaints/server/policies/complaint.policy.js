'use strict';
// =========================================================================
//
// Policies for complaints
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'complaint');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/complaint/for/project/:projectId'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


