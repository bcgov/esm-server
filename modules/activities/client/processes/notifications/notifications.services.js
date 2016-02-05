'use strict';

angular.module('tasks')
    .service('sTaskNotifications', serviceTaskNotifications);
// -----------------------------------------------------------------------------------
//
// SERVICE: Notification templates
//
// -----------------------------------------------------------------------------------
serviceTaskNotifications.$inject = ['$http'];
/* @ngInject */
function serviceTaskNotifications($http) {
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
