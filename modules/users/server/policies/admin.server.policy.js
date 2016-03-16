'use strict';
// =========================================================================
//
// Policies for users
//
// =========================================================================
var acl = require('acl');
acl = new acl(new acl.memoryBackend());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	// empty means that ONLY admin can use these paths
};

exports.isAllowed = helpers.isAllowed (acl);
