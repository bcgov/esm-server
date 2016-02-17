'use strict';
// =========================================================================
//
// Policies for activities
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));


exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'activity');
	helpers.setCRUDPermissions (acl, 'activitybase');
	helpers.setPathPermissions (acl, [
		[ '', 'user', '/api/activitybase/:activitybase/add/task/:taskbase'],
		[ '', 'user', '/api/activity/:activity/add/task/:taskbase'],
		[ '', 'user', '/api/activity/in/project/:project'],
		[ '', 'user', '/api/write/activity/in/project/:project'],
		[ '', 'user', '/api/activity/for/milestone/:milestone']
	]);
};

exports.isAllowed = helpers.isAllowed (acl);


