'use strict';
// =========================================================================
//
// Policies for invitations
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'invitation');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/sendinvitations']
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


