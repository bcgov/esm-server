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
	var getOrganization = function(req) {
		return $http({method:'GET',url: '/api/organization/' + req.id});
	};
	var addOrganization = function(req) {
		return $http({method:'POST',url: '/api/organization', data: req});
	};
	var updateOrganization = function(req) {
		console.log (req);
		return $http({method:'PUT',url: '/api/organization/' + req._id, data: req});
	};
	var deleteOrganization = function(req) {
		return $http({method:'DELETE',url: '/api/organization/' + req.id});
	};
	return {
		getOrganizations: getOrganizations,
		getOrganization: getOrganization,
		addOrganization: addOrganization,
		updateOrganization: updateOrganization,
		deleteOrganization: deleteOrganization
	};
}




