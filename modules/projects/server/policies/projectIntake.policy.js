'use strict';
// =========================================================================
//
// Policies for tasks
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'projectintake');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/projectintake/list/for/project/:project'    ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl, 'projectintake');
