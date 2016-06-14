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
.factory('Application', function ($window) {
	$window.application = {
		context: 'application',
		userCan: {}
	};
	return $window.application;
})

;




