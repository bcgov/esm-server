'use strict';

angular.module('alerts')
	.service('Alerts', serviceAlerts);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceAlerts.$inject = ['$http'];
/* @ngInject */
function serviceAlerts($http) { 

	// get all ids by user
	var getAlerts = function(req) {
		return $http({method:'GET',url: '/api/user/alert'});
	};

	// get single alert by id
	var getAlert = function(req) {
		return $http({method:'GET',url: '/api/alert/' + req._id});
	};

	// get blank object
	var getNew = function(req) {
		return $http({method:'GET',url: '/api/new/alert'});		
	};

	return {
		getAlerts: getAlerts,
		getAlert: getAlert,
		getNew: getNew 
	};
}
