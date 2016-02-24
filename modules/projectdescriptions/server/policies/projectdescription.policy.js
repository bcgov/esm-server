'use strict';
// =========================================================================
//
// Policies for projectdescriptions
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'projectdescription');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/projectdescription/for/project/:project'    ],
		[ '', 'user', '/api/projectdescription/save/as/:type'    ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


