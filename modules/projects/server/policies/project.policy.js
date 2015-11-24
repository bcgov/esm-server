'use strict';
// =========================================================================
//
// Policies for tasks
//
// =========================================================================
var acl  = require ('acl');
acl      = new acl (new acl.memoryBackend ());

exports.invokeRolesPolicies = function () {
	acl.allow ('admin', [
		'/api/project',
		'/api/project/:project',
		'/api/new/project',
		'/api/project/:project/add/bucket/:bucket',
		'/api/project/:project/add/phase/:phase',
		'/api/project/phase/:phase/add/milestone/:milestone',
		'/api/project/phase/:phase/add/activity/:activity',
		'/api/project/activity/:activity/add/task/:task',
		'/api/project/task/:task/add/requirement/:requirement',
		'/api/project/milestone/:milestone/add/project/requirement/:requirement',
		'/api/project/bucket/:bucket/add/project/requirement/:requirement',
		'/api/project/:project/set/stream/:stream'
		], '*'
	);
	acl.allow ('guest', [
		'/api/project',
		'/api/project/:project',
		'/api/new/project',
		'/api/project/:project/add/bucket/:bucket',
		'/api/project/:project/add/phase/:phase',
		'/api/project/phase/:phase/add/milestone/:milestone',
		'/api/project/phase/:phase/add/activity/:activity',
		'/api/project/activity/:activity/add/task/:task',
		'/api/project/task/:task/add/requirement/:requirement',
		'/api/project/milestone/:milestone/add/project/requirement/:requirement',
		'/api/project/bucket/:bucket/add/project/requirement/:requirement',
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


