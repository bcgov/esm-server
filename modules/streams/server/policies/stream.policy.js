'use strict';
// =========================================================================
//
// Policies for streams
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());

exports.invokeRolesPolicies = function () {
	acl.allow ('admin', [
		'/api/stream',
		'/api/stream/:stream',
		'/api/new/stream',
		'/api/stream/:stream/add/bucket/:bucket',
		'/api/stream/:stream/add/phase/:phase',
		'/api/stream/phase/:phase/add/milestone/:milestone',
		'/api/stream/phase/:phase/add/activity/:activity',
		'/api/stream/activity/:activity/add/task/:task',
		'/api/stream/task/:task/add/requirement/:requirement',
		'/api/stream/milestone/:milestone/add/stream/requirement/:requirement',
		'/api/stream/bucket/:bucket/add/stream/requirement/:requirement',
		], '*'
	);
	acl.allow ('guest', [
		'/api/stream',
		'/api/stream/:stream',
		'/api/new/stream',
		'/api/stream/:stream/add/bucket/:bucket',
		'/api/stream/:stream/add/phase/:phase',
		'/api/stream/phase/:phase/add/milestone/:milestone',
		'/api/stream/phase/:phase/add/activity/:activity',
		'/api/stream/activity/:activity/add/task/:task',
		'/api/stream/task/:task/add/requirement/:requirement',
		'/api/stream/milestone/:milestone/add/stream/requirement/:requirement',
		'/api/stream/bucket/:bucket/add/stream/requirement/:requirement',
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


