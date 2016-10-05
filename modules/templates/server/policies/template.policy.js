'use strict';
// =========================================================================
//
// Policies for templates
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'template');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/template/for/project/:projectId'    ],
		[ '', 'user', '/api/template/for/document/:documenttype'    ],
		[ 'guest', 'user', '/api/template/for/code/:code'    ],
		[ '', 'user', '/api/new/template/section'    ],
		[ '', 'user', '/api/new/template/meta'    ],
		[ '', 'user', '/api/current/templates'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


