'use strict';
// =========================================================================
//
// this is intended to be a sort of base class for all crud services in the
// client, just to avoid retyping everything over and over again
//
// =========================================================================
angular.module('core').service ('MenuControl', ['Authentication', '$state', '$http', '_', function (Authentication, $state, $http, _) {
	this.getRolesForMethod = function (method, project) {
		// var url = project? '/api/permissions/project/'+project : '/api/permissions/global';
		// return new Promise (function (resolve, reject) {
		// 	$http ({method:'GET', url:'/api/feature/permissions/' })
		// 	.then (function (res) {
		// 		resolve (res.data);
		// 	}).catch (function (res) {
		// 		reject (res.data);
		// 	});
		// });

		var ret = [];
		if (method === 'organization') ret = ['admin'];
		if (method === 'bob') ret = ['sally'];
		else ret = ['user'];
		console.log ('can access being called now with ', method, 'returning', ret);
		return ret;
	};
	this.menuAccess = function (method, project) {
		return this.getRolesForMethod (method, project);
	};
	this.routeAccess = function (method, project) {
		var roles = this.getRolesForMethod (method, project);
		var allowed = false;
		roles.forEach(function (role) {
			if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
				allowed = true;
				return true;
			}
		});
		if (!allowed) {
			if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
				$state.go('forbidden');
			} else {
				$state.go('authentication.signin');
			}
		}
	};
}]);
