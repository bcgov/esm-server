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
	helpers.setCRUDPermissions (acl, 'project');
	acl.allow ('admin', '/api/projectile', 'get');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/newcode/project/:pcode'    ],
		[ '', 'user', '/api/project/:project/publish'    ],
		[ '', 'user', '/api/project/:project/unpublish'    ],
		[ '', 'user', '/api/project/:project/submit'    ],
		[ '', 'user', '/api/project/:project/set/stream/:stream'    ],
		[ '', 'user', '/api/project/:project/complete/current/phase'    ],
		[ '', 'user', '/api/project/:project/start/next/phase'    ],
		[ 'guest', 'user', '/api/project/bycode/:projectcode'    ],
		[ 'guest', 'user', '/api/projects/lookup']
	]);
};

exports.isAllowed = helpers.isAllowed (acl, 'project');
