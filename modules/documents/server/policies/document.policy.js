'use strict';
// =========================================================================
//
// Policies for documents
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'document');

//	acl.allow ('guest', '/api/document/:project/upload', 'post');
//	helpers.setPathPermissions (acl, [
//	]);

	acl.whatResources (['user'], function (err, what) {
		console.log ('document permissions for user instide document invoke policies');
		console.log (what);
	});

};

exports.isAllowed = helpers.isAllowed (acl);
