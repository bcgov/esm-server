'use strict';
// =========================================================================
//
// access services
//
// =========================================================================
angular.module('core')
// -------------------------------------------------------------------------
//
// the normal route access for access server routes
//
// -------------------------------------------------------------------------
.factory('AccessModel', function (ModelBase, _) {
	var AccessClass = ModelBase.extend({
		urlName: 'access',
		purgeUserRoles: function (data) {
			return this.put('/api/access/userroles/purge', data);
		},
		assignUserRoles: function (data) {
			return this.put('/api/access/userroles/assign', data);
		},
		globalProjectRoles: function (contextId) {
			return this.get('/api/access/globalprojectroles');
		},
		allRoles: function (contextId) {
			return this.get('/api/access/rolelist/context/' + contextId);
		},
		roleUsers: function (contextId) {
			return this.get('/api/access/roleusers/context/' + contextId);
		},
		permissionRoles: function (resourceId) {
			return this.get('/api/access/permissionroles/resource/' + resourceId);
		},
		getRolesAndPermissionsForResource: function (opts) {
			return new Promise(function (resolve, reject) {
				resolve([]);
			});
		},
		permissionRoleIndex: function (resourceId) {
			return this.get('/api/access/permissionroleindex/resource/' + resourceId);
		},
		roleUserIndex: function (contextId) {
			return this.get('/api/access/roleuserindex/context/' + contextId);
		},
		setPermissionRoleIndex: function (resourceId, index) {
			return this.put('/api/access/permissionroleindex/resource/' + resourceId, index);
		},
		setRoleUserIndex: function (contextId, index) {
			return this.chunk({method: 'PUT', url: '/api/access/roleuserindex/context/' + contextId, data: index, headers: null, timeout: 120000} );
		},
		addRoleIfUnique: function (contextId, role) {
			return this.put('/api/access/addroleifunique/context/' + contextId, {
				context: contextId,
				role: role
			})
			.then(function (result) {
				return result.ok;
			});
		},
		addRoleUser: function (opts) {
			return this.post('/api/access/role', opts);
		},
		allUsers: function () {
			return this.get('/api/access/allusers');
		},
		getContextUsers: function(contextId) {
			return this.get('/api/access/users/context/' + contextId);
		},
		resetSessionContext: function() {
			return this.get('/api/access/session/reset');
		}
	});
	return new AccessClass();
})

// -------------------------------------------------------------------------
//
// the current context
//
// -------------------------------------------------------------------------
.factory('Application', function ($window, $http) {
	$window.application = {
		context: 'application',
		code: 'application',
		user: 0,
		userCan: {},
		//
		// if the user has changed, reload their permissions
		//
		reload: function (currentUser, force) {
			return new Promise(function (resolve, reject) {
				if ($window.application.user !== currentUser || force === true) {
					//console.log('> Application.reload(force=' + (force ? 'true' : 'false') + ') ');
					$http.get('api/application').success(function (response) {
						//console.log('userCan = ');
						//console.log(JSON.stringify(response.userCan));
						$window.application.userCan = response.userCan;
						$window.application._id = 'application';
						$window.application.user = currentUser;
						//console.log('< Application.reload(' + (force ? 'true' : 'false') + ')');
						resolve(response.userCan);
					})
					.error(reject);
				}
				else {
					resolve();
				}
			});
		}
	};
	return $window.application;
})

;




