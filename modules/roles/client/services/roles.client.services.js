'use strict';

angular.module('roles')
    .service('sRoles', serviceRoles);
// -----------------------------------------------------------------------------------
//
// Service: Roles Services
//
// -----------------------------------------------------------------------------------
serviceRoles.$inject = ['$http'];
/* @ngInject */
function serviceRoles($http) {
	var getRoles = function(req) {
		return $http({method:'GET',url: '/api/role' });
	};
	
	return {
		getRoles: getRoles
	};
}