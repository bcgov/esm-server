'use strict';
// =========================================================================
//
// this is intended to be a sort of base class for all crud services in the
// client, just to avoid retyping everything over and over again
//
// =========================================================================
angular.module('core').service ('MenuControl', ['Authentication', '$state', '$http', '_', function (Authentication, $state, $http, _) {
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
				[project, 'eao', method].join(':'),
				[project, 'pro', method].join(':'),
				project+':eao:admin',
				project+':pro:admin'
			];
		}
		else if (org === '' && project === '') {
			roles = [
				'admin',
				method
			];
		}
		else {
			roles = [
				'admin',
				[project, org, method].join(':'),
				[project, org, 'admin'].join(':')
			];
		}
		// console.log ('roles:', roles);
		return roles;
	};
	this.routeAccess = function (project, org, method) {
		this.canAccess (this.menuRoles (project, org, method));
	};
}]);
