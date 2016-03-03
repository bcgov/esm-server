'use strict';
// =========================================================================
//
// Policies for features
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'feature');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/feature/for/project/:projectId'    ],
		[ '', 'user', '/api/base/feature'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


