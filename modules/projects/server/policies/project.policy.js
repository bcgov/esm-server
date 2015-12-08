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
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/project/:project/add/bucket/:bucket'                               ],
		[ '', 'user', '/api/project/:project/add/phase/:phase'                                 ],
		[ '', 'user', '/api/project/phase/:phase/add/milestone/:milestone'                     ],
		[ '', 'user', '/api/project/phase/:phase/add/activity/:activity'                       ],
		[ '', 'user', '/api/project/activity/:activity/add/task/:task'                         ],
		[ '', 'user', '/api/project/task/:task/add/requirement/:requirement'                   ],
		[ '', 'user', '/api/project/milestone/:milestone/add/project/requirement/:requirement' ],
		[ '', 'user', '/api/project/bucket/:bucket/add/project/requirement/:requirement'       ],
		[ '', 'user', '/api/project/:project/set/stream/:stream'                               ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
