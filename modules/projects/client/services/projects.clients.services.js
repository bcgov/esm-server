'use strict';

angular.module('projects')
	.service('Projects', serviceProjects);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceProjects.$inject = ['$http'];
/* @ngInject */
function serviceProjects($http) {
	var getProjects = function(req) {
		return $http({method:'GET',url: '/api/project'});
	};
	var getProjectTypes = function(req) {
		return $http({method:'GET',url: '/api/projectTypes'});
	};
	var getProjectMilestones = function(req) {
		return $http({method:'GET',url: '/api/projectMilestones'});
	};
	return {
		getProjects: getProjects,
		getProjectTypes: getProjectTypes,
		getProjectMilestones: getProjectMilestones
	};
}
