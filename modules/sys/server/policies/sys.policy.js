'use strict';
// =========================================================================
//
// Policies for system type calls
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/sys/configs'  ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
