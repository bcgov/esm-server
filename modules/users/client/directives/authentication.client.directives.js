'use strict';

angular
	.module('users')
	.directive('tmplLogin', directiveLogin);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Login
//
// -----------------------------------------------------------------------------------
directiveLogin.$inject = [];
/* @ngInject */
function directiveLogin() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
		controller: 'controllerAuthentication',
		controllerAs: 'loginPanel'
	};
	return directive;
}