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
	var getProjectMilestones = function(req) {
		return $http({method:'GET',url: '/api/projectMilestones'});
	};
	return {
		getProjects: getProjects,
		getProjectMilestones: getProjectMilestones
	};
}
