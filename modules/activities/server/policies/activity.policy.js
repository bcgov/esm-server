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
};

exports.isAllowed = helpers.isAllowed (acl);

// exports.isAllowed = function (req, res, next) {
// 	var roles = (req.user) ? req.user.roles : ['admin'];
// 	console.log ('checking against ', roles);
// 	acl.areAnyRolesAllowed (roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
// 		if (err) {
// 			// An authorization error occurred.
// 			return res.status(500).send('Unexpected authorization error');
// 		} else {
// 			if (isAllowed) {
// 				// Access granted! Invoke next middleware
// 				return next();
// 			} else {
// 				return res.status(403).json({
// 					message: 'User is not authorized'
// 				});
// 			}
// 		}
// 	});
// };


