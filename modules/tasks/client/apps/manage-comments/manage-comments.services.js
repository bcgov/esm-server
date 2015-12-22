'use strict';

angular.module('tasks')
    .service('sTaskManageComments', serviceTaskManageComments);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceTaskManageComments.$inject = ['$http'];
/* @ngInject */
function serviceTaskManageComments($http) {
	var getAllPublicComments = function(req) {
		return $http({method:'GET',url: '/api/publiccomment'});
	};
	// var getTemplates = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/ValueComponentsTemplates'});
	// };
	return {
		getAllPublicComments: getAllPublicComments,
		// getTemplates: getTemplates
	};
}