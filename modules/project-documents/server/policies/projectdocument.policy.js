'use strict';
// =========================================================================
//
// Policies for projectdocuments
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'projectdocument');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/projectdocument/for/project/:projectId'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


