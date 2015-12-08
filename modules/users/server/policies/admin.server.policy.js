'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
	// empty means that ONLY admin can use these paths
};

exports.isAllowed = helpers.isAllowed (acl);
