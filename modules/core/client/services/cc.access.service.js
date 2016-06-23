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
.factory ('AccessModel', function (ModelBase, _) {
	var AccessClass = ModelBase.extend ({
		urlName : 'access',
		allRoles: function (contextId) {
			return this.get ('/api/access/rolelist/context/'+contextId);
		},
		roleUsers: function (contextId) {
			return this.get ('/api/access/roleusers/context/'+contextId);
		},
		permissionRoles: function (resourceId) {
			return this.get ('/api/access/permissionroles/resource/'+resourceId);
		},
		getRolesAndPermissionsForResource: function (opts) {
			return new Promise (function (resolve, reject) {
				resolve ([]);
			});
		},
		permissionRoleIndex: function (resourceId) {
			return this.get ('/api/access/permissionroleindex/resource/'+resourceId);
		},
		roleUserIndex: function (contextId) {
			return this.get ('/api/access/roleuserindex/context/'+contextId);
		},
		setPermissionRoleIndex: function (resourceId, index) {
			return this.put ('/api/access/permissionroleindex/resource/'+resourceId, index);
		},
		setRoleUserIndex: function (contextId, index) {
			return this.put ('/api/access/roleuserindex/context/'+contextId, index);
		}
	});
	return new AccessClass ();
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
		reload : function (currentUser) {
			return new Promise (function (resolve, reject) {
				if ($window.application.user !== currentUser) {
					$http.get ('api/application').success (function (response) {
						$window.application.userCan = response.userCan;
						$window.application._id = 'application';
						$window.application.user = currentUser;
						console.log ($window.application);
					})
					.error (reject);
				}
				else {
					resolve ();
				}
			});
		}
	};
	return $window.application;
})

;




