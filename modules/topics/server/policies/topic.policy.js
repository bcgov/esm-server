'use strict';
// =========================================================================
//
// Policies for topics
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'topic');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/topics/for/pillar/:pillar'   ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


