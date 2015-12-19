'use strict';

angular.module('tasks')
    .service('ManageIssues', serviceTaskManageIssues);
// -----------------------------------------------------------------------------------
//
// SERVICE: Manage Issues templates
//
// -----------------------------------------------------------------------------------
serviceTaskManageIssues.$inject = ['$http', 'API'];
/* @ngInject */
function serviceTaskManageIssues($http, API) {
	// var getNew = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/notificationNew'});
	// };
	// var getTemplates = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/notificationTemplates'});
	// };
	return {
		// getNew: getNew,
		// getTemplates: getTemplates
	};
}