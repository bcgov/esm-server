'use strict';
// =========================================================================
//
// Policies for orgs
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'recentActivity');
	helpers.setPathPermissions (acl, [
		[ 'guest', 'user', '/api/recentactivity/active/list'],
		[ 'guest', 'user', '/api/recentactivity/active/rss']
	]);	
};

exports.isAllowed = helpers.isAllowed (acl);


