'use strict';

angular.module('tasks')
    .service('Notification', serviceNotifications);
// -----------------------------------------------------------------------------------
//
// SERVICE: Notification templates
//
// -----------------------------------------------------------------------------------
serviceNotifications.$inject = ['$http', 'API'];
/* @ngInject */
function serviceNotifications($http, API) {
	var getNew = function(req) {
		return $http({method:'GET',url: API + '/v1/notificationNew'});
	};
	var getTemplates = function(req) {
		return $http({method:'GET',url: API + '/v1/notificationTemplates'});
	};
	return {
		getNew: getNew,
		getTemplates: getTemplates
	};
}
