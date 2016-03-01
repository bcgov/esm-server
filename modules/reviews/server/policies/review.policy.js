'use strict';
// =========================================================================
//
// Policies for reviews
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'review');
	helpers.setCRUDPermissions (acl, 'reviewperiod');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/publish/review/:review'   ],
		[ '', 'user', '/api/unpublish/review/:review'   ],
		[ '', 'user', '/api/resolve/review/:review'   ],
		[ '', 'user', '/api/reviews/type/:type/target/:targettype/:targetid'   ],
		[ '', 'user', '/api/reviews/ancestor/:reviewId'   ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


