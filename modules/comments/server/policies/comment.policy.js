'use strict';
// =========================================================================
//
// Policies for comments
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'comment');
	helpers.setCRUDPermissions (acl, 'commentperiod');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/publish/comment/:comment'   ],
		[ '', 'user', '/api/unpublish/comment/:comment'   ],
		[ '', 'user', '/api/resolve/comment/:comment'   ],
		[ '', 'user', '/api/comments/type/:type/target/:targettype/:targetid'   ],
		[ '', 'user', '/api/comments/ancestor/:commentId'   ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


