'use strict';

angular
	.module('users')
	.directive('tmplLogin', directiveLogin)
	.directive('userIs', directiveUserIs)
	.directive('userIsNot', directiveUserIsNot);	

// -----------------------------------------------------------------------------------
//
// General User Role Detection
//
// -----------------------------------------------------------------------------------
var directiveUserHasRole = function(roles, _, Authentication) {
	if (Authentication.user === '') return false;

	var arr = String(roles).split(',');
	var found = false;
	// if user has any of the roles
	if( _.indexOf(Authentication.user.roles, 'admin') > -1) {
		found = true;
	} else {
		_.each(arr, function(role) {
			if( _.indexOf(Authentication.user.roles, role.trim()) > -1) {
				found = true;
			}
		});
	}
	return found;

};
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
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Has Role (string or list) or hide element
//
// -----------------------------------------------------------------------------------
directiveUserIs.$inject = ['_', 'Authentication'];
/* @ngInject */
function directiveUserIs(_, Authentication) {

	var directive = {
		restrict: 'A',
		link: function(scope, element, attrs) {

			scope.$watch(function() {return attrs.userIs;}, function(newValue){
				if(newValue) {
					// remove the element if false is returned
					if ( !directiveUserHasRole(attrs.userIs, _, Authentication) ) {
						element.remove();
					}
				}
			});

		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Has Role (string or list) and hide element
//
// -----------------------------------------------------------------------------------
directiveUserIsNot.$inject = ['_', 'Authentication'];
/* @ngInject */
function directiveUserIsNot(_, Authentication) {

	var directive = {
		restrict: 'A',
		link: function(scope, element, attrs) {

			scope.$watch(function() {return attrs.userIsNot;}, function(newValue){
				if(newValue) {
					// remove the elemnt if false is returned
					if ( directiveUserHasRole(attrs.userIsNot, _, Authentication) ) {
						element.remove();
					}
				}
			});

		}
	};
	return directive;
}
