'use strict';

angular.module('activity')
	.service('sActivity', serviceActivity);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceActivity.$inject = ['$http'];
/* @ngInject */
function serviceActivity($http) {

	var getActivity = function(req) {
		return $http({method:'GET',url: '/api/activity/' + req.id});
	};

	var getProjectActivities = function(req) {
		return $http({method:'GET',url: '/api/activity/'});
	};

	return {
		getProjectActivities: getProjectActivities,
		getActivity: getActivity
	};
}
