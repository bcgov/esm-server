'use strict';

angular.module('control')
    .service('sProcessInvitations', serviceProcessInvitations);
// -----------------------------------------------------------------------------------
//
// SERVICE: Notification templates
//
// -----------------------------------------------------------------------------------
serviceProcessInvitations.$inject = ['$http'];
/* @ngInject */
function serviceProcessInvitations($http) {
	var getTemplates = function(req) {
		return $http({method:'GET',url: '/api/emailtemplate'});
	};
	return {
		getTemplates: getTemplates
	};
}
