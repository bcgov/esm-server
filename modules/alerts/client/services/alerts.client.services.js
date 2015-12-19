'use strict';

angular.module('alerts')
	.service('Alerts', serviceAlerts);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceAlerts.$inject = ['$http', 'SERVERAPI'];
/* @ngInject */
function serviceAlerts($http, SERVERAPI) {

	// get all ids by user
	var getAlerts = function(req) {
		return $http({method:'GET',url: SERVERAPI + '/user/alert'});
	};

	// get single alert by id
	var getAlert = function(req) {
		return $http({method:'GET',url: SERVERAPI + '/alert/' + req._id});
	};

	// get blank object
	var getNew = function(req) {
		return $http({method:'GET',url: SERVERAPI + '/new/alert'});		
	};

	return {
		getAlerts: getAlerts,
		getAlert: getAlert,
		getNew: getNew 
	};
}
