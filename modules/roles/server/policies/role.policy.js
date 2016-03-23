'use strict';
// =========================================================================
//
// Policies for roles
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/role'   ],
		[ '', 'user', '/api/new/role'   ],
		[ '', 'user', '/api/role/:role'   ],
		[ '', 'user', '/api/system/roles'   ],
		[ '', 'user', '/api/users/in/role/:role'   ],
		[ '', 'user', '/api/roles/project/:project'   ],
		[ '', 'user', '/api/users/roles/project/:project'   ],
		[ '', 'user', '/api/projects/with/role/:role'   ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


