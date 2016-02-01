'use strict';
// =========================================================================
//
// Policies for streams
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'stream');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/stream/:stream/add/phase/:phasebase'                             ]
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
