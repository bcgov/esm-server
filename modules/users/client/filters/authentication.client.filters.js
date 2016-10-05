'use strict';

angular
	.module('users')
	.filter('userIs', filterUserIs)
	.filter('userIsNot', filterUserIsNot);	

// -----------------------------------------------------------------------------------
//
// General User Role Detection
//
// -----------------------------------------------------------------------------------
var filterUserHasRole = function(roles, _, Authentication) {
	if (Authentication.user === '') return false;

	var arr = roles.split(',');
	var found = false;
	// if user has any of the roles
	_.each(arr, function(role) {
		if( _.indexOf(Authentication.user.roles, role) > -1) {
			found = true;
		}
	});
	return found;
};
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Has Role (string or list) or hide element
//
// -----------------------------------------------------------------------------------
filterUserIs.$inject = ['_', 'Authentication'];
/* @ngInject */
function filterUserIs(_, Authentication) {
	return function(roles) {
		return filterUserHasRole(roles, _, Authentication);
	};
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Has Role (string or list) and hide element
//
// -----------------------------------------------------------------------------------
filterUserIsNot.$inject = ['_', 'Authentication'];
/* @ngInject */
function filterUserIsNot(_, Authentication) {
	return function(roles) {
		return filterUserHasRole(roles, _, Authentication);
	};
}
