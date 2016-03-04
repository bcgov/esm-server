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
	helpers.setCRUDPermissions (acl, 'valuedcomponent');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/valuedcomponent/new/boundary'   ],
		[ '', 'user', '/api/valuedcomponent/new/condition'  ],
		[ '', 'user', '/api/valuedcomponent/new/effect'     ],
		[ '', 'user', '/api/valuedcomponent/new/mitigation' ],
		[ '', 'user', '/api/valuedcomponent/new/cumulative' ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


