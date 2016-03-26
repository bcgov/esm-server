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
        [ '', 'user', '/api/documentlist'    ],
        [ '', 'user', '/api/documents/:projectid'    ],
        [ '', 'user', '/api/documents/versions/:documentid'    ],
        [ '', 'user', '/api/documents/folderNames/:projectid'    ],
        [ '', 'user', '/api/documents/approveAndDownload/:document'    ],
        [ '', 'user', '/api/documents/types/:projectid'    ]
	]);

};

exports.isAllowed = helpers.isAllowed (acl);
