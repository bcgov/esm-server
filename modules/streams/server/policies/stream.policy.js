'use strict';
// =========================================================================
//
// Policies for streams
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'stream');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/stream/:stream/add/bucket/:bucket'                               ],
		[ '', 'user', '/api/stream/:stream/add/phase/:phase'                                 ],
		[ '', 'user', '/api/stream/phase/:phase/add/milestone/:milestone'                    ],
		[ '', 'user', '/api/stream/phase/:phase/add/activity/:activity'                      ],
		[ '', 'user', '/api/stream/activity/:activity/add/task/:task'                        ],
		[ '', 'user', '/api/stream/task/:task/add/requirement/:requirement'                  ],
		[ '', 'user', '/api/stream/milestone/:milestone/add/stream/requirement/:requirement' ],
		[ '', 'user', '/api/stream/bucket/:bucket/add/stream/requirement/:requirement'       ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
