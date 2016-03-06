'use strict';

angular.module('projects')
	.directive('tmplProjects', directiveProjects)
	.directive('tmplProjectsList', directiveProjectsList)
	.directive('tmplProjectsSchedule', directiveProjectsSchedule)
	.directive('tmplProjectsList2', directiveProjectsList2)
	.directive('tmplProjectsSearch', directiveProjectsSearch)
	// .directive('tmplProjectsPanels', directiveProjectsPanels)
	.directive('tmplProjectsMap', directiveProjectsMap)
	.directive('tmplUserActivities', directiveUserActivities);
	// .directive('tmplProjectsFilterBar', directiveProjectsFilterBar);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
directiveProjects.$inject = [];
/* @ngInject */
function directiveProjects() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/projects/client/views/projects.html',
		controller: 'controllerProjects',
		controllerAs: 'projects'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects List
//
// -----------------------------------------------------------------------------------
directiveProjectsList.$inject = [];
/* @ngInject */
function directiveProjectsList() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/projects/client/views/projects-partials/projects-list.html',
		controller: 'controllerProjectsList',
		controllerAs: 'projectList',
		scope: {
			projects: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Schedule
//
// -----------------------------------------------------------------------------------
directiveProjectsSchedule.$inject = [];
/* @ngInject */
function directiveProjectsSchedule() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-partials/projects-schedule.html',
		controller: 'controllerProjectsList',
		controllerAs: 'projectList',
		scope: {
			projects: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects List
//
// -----------------------------------------------------------------------------------
directiveProjectsList2.$inject = [];
/* @ngInject */
function directiveProjectsList2 () {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-partials/projects-list.html',
		controller: 'controllerProjectsList2',
		controllerAs: 'projectList',
		scope: {
			projects: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Search
//
// -----------------------------------------------------------------------------------
directiveProjectsSearch.$inject = [];
/* @ngInject */
function directiveProjectsSearch() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-partials/projects-search.html',
		controller: 'controllerProjectsSearch',
		controllerAs: 'projectsSearch'
	};
	return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Panels
//
// -----------------------------------------------------------------------------------
// directiveProjectsPanels.$inject = [];
// /* @ngInject */
// function directiveProjectsPanels() {
// 	var directive = {
// 		restrict: 'E',
// 		templateUrl: 'modules/projects/client/views/projects-partials/projects-panels.html',
// 		controller: 'controllerProjectsList',
// 		controllerAs: 'projectList',
// 		scope: {
// 			projects: '='
// 		}
// 	};
// 	return directive;
// }
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Activities
//
// -----------------------------------------------------------------------------------
directiveUserActivities.$inject = [];
/* @ngInject */
function directiveUserActivities() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/projects/client/views/projects-partials/user-activities.html',
		controller: 'controllerUserActivities',
		controllerAs: 'userActs'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Map
//
// -----------------------------------------------------------------------------------
directiveProjectsMap.$inject = ['google'];
/* @ngInject */
function directiveProjectsMap(google) {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/projects/client/views/projects-partials/projects-map.html',
		controller: 'controllerProjectsList',
		controllerAs: 'projectList',
		scope: {
			projects: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Filter Bar
//
// -----------------------------------------------------------------------------------
// directiveProjectsFilterBar.$inject = [];
// /* @ngInject */
// function directiveProjectsFilterBar() {
// 	var directive = {
// 		restrict: 'E',
// 		replace: true,
// 		scope: {
// 			data: '='
// 		},
// 		templateUrl: 'modules/projects/client/views/projects-partials/projects-filter-bar.html',
// 		controller: 'controllerProjectsFilterBar',
// 		controllerAs: 'fbc'
// 	};
// 	return directive;
// }
