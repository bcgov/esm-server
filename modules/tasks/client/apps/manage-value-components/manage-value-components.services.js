'use strict';

angular.module('tasks')
    .service('ValueComponents', serviceTaskValueComponents);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceTaskValueComponents.$inject = ['$http'];
/* @ngInject */
function serviceTaskValueComponents($http) {
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