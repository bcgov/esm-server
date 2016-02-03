'use strict';
// =========================================================================
//
// Policies for organizations
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'organization');
	helpers.setPathPermissions (acl, [
		[ 'guest', 'user', '/api/base/organization']
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


/*
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
	helpers.setCRUDPermissions (acl, 'organization');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/organization/:organization/add/bucket/:bucket'                               ],
		[ '', 'user', '/api/organization/:organization/add/phase/:phase'                                 ],
		[ '', 'user', '/api/organization/phase/:phase/add/milestone/:milestone'                     ],
		[ '', 'user', '/api/organization/phase/:phase/add/activity/:activity'                       ],
		[ '', 'user', '/api/organization/activity/:activity/add/task/:task'                         ],
		[ '', 'user', '/api/organization/task/:task/add/requirement/:requirement'                   ],
		[ '', 'user', '/api/organization/milestone/:milestone/add/organization/requirement/:requirement' ],
		[ '', 'user', '/api/organization/bucket/:bucket/add/organization/requirement/:requirement'       ],
		[ '', 'user', '/api/organization/:organization/set/stream/:stream'                               ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
*/