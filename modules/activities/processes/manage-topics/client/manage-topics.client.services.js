'use strict';

angular.module('process')
    .service('sProcessTopics', serviceProcessTopics);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceProcessTopics.$inject = ['$http'];
/* @ngInject */
function serviceProcessTopics($http) {
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
