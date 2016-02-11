'use strict';

angular.module('core')
	.directive('tmplOrganizationsDisplayEdit', directiveOrganizationsDisplayEdit);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveOrganizationsDisplayEdit.$inject = [];
/* @ngInject */
function directiveOrganizationsDisplayEdit() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organization-display-edit-form.html',
		controller: 'controllerOrganizationsDisplayEdit',
		controllerAs: 'displayEdit',
		scope: {
			options: '@'
		}
	};
	return directive;
}


	/*
	.directive('tmplOrganizations', directiveOrganizations)
	.directive('tmplOrganizationsList', directiveOrganizationsList)
	.directive('tmplOrganizationsSchedule', directiveOrganizationsSchedule)
	// .directive('tmplOrganizationsPanels', directiveOrganizationsPanels)
	.directive('tmplOrganizationsMap', directiveOrganizationsMap);
	// .directive('tmplOrganizationsFilterBar', directiveOrganizationsFilterBar);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Organizations Main
//
// -----------------------------------------------------------------------------------
directiveOrganizations.$inject = [];
// @ngInject
function directiveOrganizations() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations.html',
		controller: 'controllerOrganizations',
		controllerAs: 'organizations'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations List
//
// -----------------------------------------------------------------------------------
// @ngInject
function directiveOrganizationsList() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-list.html',
		controller: 'controllerOrganizationsList',
		controllerAs: 'organizationList',
		scope: {
			organizations: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Schedule
//
// -----------------------------------------------------------------------------------
directiveOrganizationsSchedule.$inject = [];
// @ngInject
function directiveOrganizationsSchedule() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-schedule.html',
		controller: 'controllerOrganizationsList',
		controllerAs: 'organizationList',
		scope: {
			organizations: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Panels
//
// -----------------------------------------------------------------------------------
// directiveOrganizationsPanels.$inject = [];
// // @ngInject
// function directiveOrganizationsPanels() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-panels.html',
// 		controller: 'controllerOrganizationsList',
// 		controllerAs: 'organizationList',
// 		scope: {
// 			organizations: '='
// 		}
// 	};
// 	return directive;
// }
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Map
//
// -----------------------------------------------------------------------------------
directiveOrganizationsMap.$inject = ['google'];
// @ngInject
function directiveOrganizationsMap(google) {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-map.html',
		controller: 'controllerOrganizationsList',
		controllerAs: 'organizationList',
		scope: {
			organizations: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Organizations Filter Bar
//
// -----------------------------------------------------------------------------------
// directiveOrganizationsFilterBar.$inject = [];
// // @ngInject
// function directiveOrganizationsFilterBar() {
// 	var directive = {
// 		restrict: 'E',
// 		replace: true,
// 		scope: {
// 			data: '='
// 		},
// 		templateUrl: 'modules/organizations/client/views/organizations-partials/organizations-filter-bar.html',
// 		controller: 'controllerOrganizationsFilterBar',
// 		controllerAs: 'fbc'
// 	};
// 	return directive;
// }
		*/