'use strict';

angular
	.module('user')
	.directive('tmplQuicklinksThumbnails', directiveQuicklinksThumbnails)
	.directive('tmplCompanyEntryForm', directiveCompanyEntryForm)
	.directive('tmplUserEntryForm', directiveUserEntryForm);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Project Schedule
//
// -----------------------------------------------------------------------------------
directiveQuicklinksThumbnails.$inject = [];
/* @ngInject */
function directiveQuicklinksThumbnails() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/user-partials/user-quicklinks.html',
		controller: 'controllerUsersQuicklinks',
		controllerAs: 'uql'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Company Entry Form
//
// -----------------------------------------------------------------------------------
directiveCompanyEntryForm.$inject = [];
/* @ngInject */
function directiveCompanyEntryForm() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/user-partials/user-company.html',
		controller: 'controllerCompanyEntryForm',
		controllerAs: 'uco',
		scope: {
			company: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Entry Form
//
// -----------------------------------------------------------------------------------
directiveUserEntryForm.$inject = [];
/* @ngInject */
function directiveUserEntryForm() {

	var directive = {
		restrict: 'E',
		templateUrl: 'modules/users/client/views/user-partials/user-user.html',
		controller: 'controllerUserEntryForm',
		controllerAs: 'uu',
		scope: {
			project: '=',
			company: '=',
			user: '='
		}
	};
	return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: List Users by Organization
//
// -----------------------------------------------------------------------------------
//directiveUsersByOrg.$inject = [];
function directiveUsersByOrg() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/users/client/views/users-partials/users-by-org-list.html',
		controller: 'controllerUsersByOrg',
		controllerAs: 'usersByOrg',
		scope: {
			organizationId: '@',
			mode: '@'
		}
	};
	return directive;
}
