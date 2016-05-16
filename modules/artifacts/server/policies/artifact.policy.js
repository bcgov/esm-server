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
	helpers.setCRUDPermissions (acl, 'artifacttype');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/publish/artifact/:artifact'   ],
		[ '', 'user', '/api/unpublish/artifact/:artifact'   ],
		[ '', 'user', '/api/artifacttype/template/types'],
		[ 'guest', 'user', '/api/artifact/for/project/:projectid'],
		[ 'guest', 'user', '/api/artifact/for/project/:projectid/not/:filtertype'],
		[ 'guest', 'user', '/api/artifact/for/project/:projectid/:type'],
		[ '', 'user', '/api/artifact/project/:project/from/type/:documenttype'],
		[ '', 'user', '/api/artifact/project/:projectid/available/types'],
		[ '', 'user', '/api/artifact/next/stage/:artifact'],
		[ '', 'user', '/api/artifact/prev/stage/:artifact'],
		[ 'guest', 'user', '/api/artifacttype/code/:code'],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


