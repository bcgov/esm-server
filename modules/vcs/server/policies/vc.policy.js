'use strict';
// =========================================================================
//
// Policies for vcs
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'vc');
};

exports.isAllowed = helpers.isAllowed (acl);


