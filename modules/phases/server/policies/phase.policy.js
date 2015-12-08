'use strict';
// =========================================================================
//
// Policies for phases
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'phase');
};

exports.isAllowed = helpers.isAllowed (acl);
