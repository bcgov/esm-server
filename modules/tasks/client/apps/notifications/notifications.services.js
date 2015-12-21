'use strict';

angular.module('tasks')
    .service('Notification', serviceNotifications);
// -----------------------------------------------------------------------------------
//
// SERVICE: Notification templates
//
// -----------------------------------------------------------------------------------
serviceNotifications.$inject = ['$http'];
/* @ngInject */
function serviceNotifications($http) {
	var getNew = function(req) {
		return $http({method:'GET',url: '/api/new/notification'});
	};
	var getTemplates = function(req) {
		return $http({method:'GET',url: '/api/notificationTemplates'});
	};
	return {
		getNew: getNew,
		getTemplates: getTemplates
	};
}
