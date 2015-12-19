'use strict';

angular.module('activity')
	.service('Activity', serviceActivity);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceActivity.$inject = ['$http'];
/* @ngInject */
function serviceActivity($http) {

	var getProjectActivity = function(req) {
		return $http({method:'GET',url: '/api/activity/' + req.id});
	};

	return {
		getProjectActivity: getProjectActivity
	};
}
