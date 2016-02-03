'use strict';

angular.module('organizations')
	.service('Organizations', serviceOrganizations);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Organizations Main
//
// -----------------------------------------------------------------------------------
serviceOrganizations.$inject = ['$http'];
/* @ngInject */
function serviceOrganizations($http) {
	var getOrganizations = function(req) {
		return $http({method:'GET',url: '/api/organization'});
	};
	/*var getOrganizationMilestones = function(req) {
		return $http({method:'GET',url: '/api/organizationMilestones'});
	};*/
	return {
		getOrganizations: getOrganizations
		//getOrganizationMilestones: getOrganizationMilestones
	};
}




