'use strict';

angular
	.module('user')
		.service('User', serviceUser);

// ----- directiveFunction -----
serviceUser.$inject = ['$http'];
/* @ngInject */
function serviceUser($http) {
	// var getUser = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/user/' + req.id});
	// };
	// var getQuicklinks = function(req) {
	// 	return $http({method:'GET',url: API + '/v1/userQuicklinks'});
	// };

	return {
		// getUser: getUser,
		// getQuicklinks: getQuicklinks
	};
}
