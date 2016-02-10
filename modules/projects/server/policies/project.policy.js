'use strict';
// =========================================================================
//
// Policies for tasks
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());
var helpers  = require (require('path').resolve('./modules/core/server/controllers/core.helpers.controller'));

exports.invokeRolesPolicies = function () {
	helpers.setCRUDPermissions (acl, 'project');
	// helpers.setPathPermissions (acl, [
	// 	[ '', 'user', '/api/projects/with/status/:statustoken'      ],
	// 	[ '', 'user', '/api/project/:project/add/phase/:phasebase'  ],
	// 	[ '', 'user', '/api/project/:project/set/stream/:stream'    ]
	// ]);
	acl.whatResources (['user'], function (err, what) {
		console.log ("++++++++++++++++++++++++++++++++ Projects");
		console.log ('project permissions for user instide project invoke policies');
		console.log (what);
	});
};

exports.isAllowed = helpers.isAllowed (acl, 'project');
