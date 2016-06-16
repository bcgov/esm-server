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
		user: 0,
		userCan: {},
		reload : function (currentUser) {
			return new Promise (function (resolve, reject) {
				if ($window.application.user !== currentUser) {
					$http.get ('api/access/permissions/context/application/resource/application').success (function (response) {
						$window.application.userCan = {};
						response.map (function (v) { $window.application.userCan[v] = true; });
						$window.application.user = currentUser;
						resolve ();
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




