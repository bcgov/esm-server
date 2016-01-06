'use strict';

angular.module('utils')
    .service('Utils', serviceUtils);
// -----------------------------------------------------------------------------------
//
// Service: Util Services
//
// -----------------------------------------------------------------------------------
serviceUtils.$inject = ['$http'];
/* @ngInject */
function serviceUtils($http) {
	var getRecentActivity = function(req) {
		return $http({method:'GET',url: 'api/project'});
	};
	var getQuickLinks = function(req) {
		return $http({method:'GET',url: 'api/project'});
	};
	// var getProjectMilestones = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/projectMilestones'});
	// };
	var getCommonLayers = function(req) {
		return [];
	};
	var getResearchFocus = function(req) {
		return [];
	};
//   	var getResearchResults = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/research/' + req.term });
	// };
	// var getProjectResearchDetail = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/researchDetail/' + req.seed + '/' + req.term });
	// }
	var getRoles = function(req) {
		return $http({method:'GET',url: 'api/roles' });
	};
	
	return {
		// getCurrentUser: getCurrentUser,
		getRecentActivity: getRecentActivity,
		getQuickLinks: getQuickLinks,
		// getProjectMilestones: getProjectMilestones,
		getCommonLayers: getCommonLayers,
		getResearchFocus: getResearchFocus,
		// getResearchResults: getResearchResults,
		// getProjectResearchDetail: getProjectResearchDetail,
		getRoles: getRoles
	};
}