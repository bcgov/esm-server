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

	helpers.setPathPermissions (acl, [
        [ 'guest', 'user', '/api/documentlist'    ],
        [ 'guest', 'user', '/api/documents/:projectid'    ],
        [ 'guest', 'user', '/api/documents/versions/:documentid'    ],
        [ 'guest', 'user', '/api/documents/folderNames/:projectid'    ],
        [ '', 'user', '/api/documents/approveAndDownload/:document'    ],
        [ 'guest', 'user', '/api/documents/types/:projectid'    ],
        [ 'guest', 'user', '/api/documents/memtypes/:projectid'    ]
	]);

};

exports.isAllowed = helpers.isAllowed (acl);
