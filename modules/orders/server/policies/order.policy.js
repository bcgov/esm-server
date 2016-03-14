'use strict';
// =========================================================================
//
// Policies for orders
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'order');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/order/for/project/:projectId'    ],
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


