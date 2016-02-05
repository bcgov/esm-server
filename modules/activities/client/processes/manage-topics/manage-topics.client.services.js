'use strict';

angular.module('tasks')
    .service('sTaskTopics', serviceTaskTopics);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceTaskTopics.$inject = ['$http'];
/* @ngInject */
function serviceTaskTopics($http) {
	// var getNew = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/ValueComponentsNew'});
	// };
	// var getTemplates = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/ValueComponentsTemplates'});
	// };
	return {
		// getNew: getNew,
		// getTemplates: getTemplates
	};
}