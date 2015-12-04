'use strict';
// =========================================================================
//
// Policies for buckets
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());

exports.invokeRolesPolicies = function () {
	acl.allow ('admin', [
		'/api/bucket',
		'/api/bucket/:bucket',
		'/api/base/bucket',
		'/api/new/bucket'
		], '*'
	);
	acl.allow ('guest', [
		'/api/bucket',
		'/api/bucket/:bucket',
		'/api/base/bucket',
		'/api/new/bucket'
		], 'get'
	);
};

exports.isAllowed = function (req, res, next) {
	var roles = (req.user) ? req.user.roles : ['admin'];
	acl.areAnyRolesAllowed (roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
		if (err) {
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				// Access granted! Invoke next middleware
				return next();
			} else {
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});
};


