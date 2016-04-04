'use strict';
// =========================================================================
//
// Policies for projectconditions
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'projectcondition');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/projectcondition/for/project/:projectId' ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


