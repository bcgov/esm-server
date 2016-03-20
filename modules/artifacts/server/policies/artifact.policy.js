'use strict';
// =========================================================================
//
// Policies for artifacts
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'artifact');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/artifact/for/project/:projectid'],
		[ '', 'user', '/api/artifact/project/:project/from/type/:documenttype'],
		[ '', 'user', '/api/artifact/project/:projectid/available/types'],
		[ '', 'user', '/api/artifact/next/stage/:artifact'],
		[ '', 'user', '/api/artifact/prev/stage/:artifact'],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


