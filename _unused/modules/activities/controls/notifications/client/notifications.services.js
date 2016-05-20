'use strict';

angular.module('control')
    .service('sProcessNotifications', serviceProcessNotifications);
// -----------------------------------------------------------------------------------
//
// SERVICE: Notification templates
//
// -----------------------------------------------------------------------------------
serviceProcessNotifications.$inject = ['$http'];
/* @ngInject */
function serviceProcessNotifications($http) {
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
