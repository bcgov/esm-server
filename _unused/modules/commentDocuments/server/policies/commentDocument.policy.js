'use strict';
// =========================================================================
//
// Policies for commentDocuments
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'commentdocument');
	acl.allow ('guest', '/api/commentdocument/publiccomment/:publiccommentid/upload', 'post');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/commentdocument/:commentdocument/eao/defer'  ],
		[ '', 'user', '/api/commentdocument/:commentdocument/eao/accept'  ],
		[ '', 'user', '/api/commentdocument/:commentdocument/eao/reject'  ],
		[ '', 'user', '/api/commentdocument/:commentdocument/eao/publish'  ],
		[ '', 'user', '/api/commentdocument/:commentdocument/notate'  ],
		[ 'guest', 'user', '/api/commentdocument/:commentdocument/fetch'  ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


