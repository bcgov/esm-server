'use strict';

angular.module('projects')
	.service('Projects', serviceProjects);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceProjects.$inject = ['$http', 'API', 'SERVERAPI'];
/* @ngInject */
function serviceProjects($http, API, SERVERAPI) {
	var getProjects = function(req) {
		return $http({method:'GET',url: SERVERAPI + '/project'});
	};
	var getProjectTypes = function(req) {
		return $http({method:'GET',url: API + '/v1/projectTypes'});
	};
	var getProjectMilestones = function(req) {
		return $http({method:'GET',url: API + '/v1/projectMilestones'});
	};
	return {
		getProjects: getProjects,
		getProjectTypes: getProjectTypes,
		getProjectMilestones: getProjectMilestones
	};
}
