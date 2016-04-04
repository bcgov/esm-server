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
		// console.log ('can access being called now with ', method, 'returning', ret);
		return ret;
	};
	this.menuAccess = function (method, project) {
		return this.getRolesForMethod (method, project);
	};
	this.canAccess = function (roles) {
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
	this.menuRoles = function (project, org, method) {
		var roles;
		if (org === 'any') {
			roles = [
				'admin',
				project+':eao:'+method,
				project+':pro:'+method,
				project+':eao:admin',
				project+':pro:admin'
			];
		}
		else {
			roles = [
				'admin',
				project+':'+org+':'+method,
				project+':'+org+':admin'
			];
		}
		return roles;
	};
	this.routeAccess = function (project, org, method) {
		this.canAccess (this.menuRoles (project, org, method));
	};
}]);
