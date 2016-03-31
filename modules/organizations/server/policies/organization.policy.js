'use strict';
// =========================================================================
//
// Policies for organizations
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'organization');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/users/for/org/:orgid'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
