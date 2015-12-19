'use strict';

angular.module('tasks')
    .service('ValueComponents', serviceTaskValueComponents);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceTaskValueComponents.$inject = ['$http', 'API'];
/* @ngInject */
function serviceTaskValueComponents($http, API) {
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