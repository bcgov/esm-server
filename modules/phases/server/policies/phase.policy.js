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
	helpers.setCRUDPermissions (acl, 'phasebase');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/phasebase/:phasebase/add/milestone/:milestonebase'],
		[ '', 'user', '/api/phase/:phase/add/milestone/:milestonebase'],
		[ '', 'user', '/api/phase/in/project/:project'],
		[ '', 'user', '/api/write/phase/in/project/:project']
	]);
};

exports.isAllowed = helpers.isAllowed (acl);
