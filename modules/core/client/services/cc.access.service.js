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
		//
		// if the user has changed, reload their permissions
		//
		reload : function (currentUser) {
			return new Promise (function (resolve, reject) {
				if ($window.application.user !== currentUser) {
					$http.get ('api/application').success (function (response) {
						$window.application.userCan = response.userCan;
						$window.application.user = currentUser;
						console.log ($window.application.userCan);
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




