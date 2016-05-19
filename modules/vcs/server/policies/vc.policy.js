'use strict';
// =========================================================================
//
// Policies for vcs
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'vc');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/vc/for/project/:projectid'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


