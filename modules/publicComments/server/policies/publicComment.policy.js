'use strict';
// =========================================================================
//
// Policies for publicComments
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'publiccomment');
	//
	// guest can post comment or doc
	//
	acl.allow ('guest', '/api/publiccomment/:publiccomment', 'post');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/publiccomment/:publiccomment/eaodefer'         ],
		[ '', 'user', '/api/publiccomment/:publiccomment/eaoaccept'           ],
		[ '', 'user', '/api/publiccomment/:publiccomment/eaoreject'           ],
		[ '', 'user', '/api/publiccomment/:publiccomment/eaopublish'           ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


