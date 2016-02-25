'use strict';
// =========================================================================
//
// Policies for wgcomments
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'wgcomment');
	helpers.setCRUDPermissions (acl, 'wgcommentperiod');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/new/wgcommentperiod/for/project/:project'    ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


