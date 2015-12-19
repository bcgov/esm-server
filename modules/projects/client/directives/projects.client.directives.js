'use strict';

angular.module('projects')
	.directive('tmplProjectsList', directiveProjectsList)
	.directive('tmplProjectsSchedule', directiveProjectsSchedule)
	.directive('tmplProjectsPanels', directiveProjectsPanels)        
	.directive('tmplProjectsMap', directiveProjectsMap)
	.directive('tmplProjectsIntake', directiveProjectsIntake)        
	.directive('tmplProjectsFilterBar', directiveProjectsFilterBar);
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
// DIRECTIVE: Projects Panels
//
// -----------------------------------------------------------------------------------
directiveProjectsPanels.$inject = [];
/* @ngInject */
function directiveProjectsPanels() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-partials/projects-panels.html',
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
// DIRECTIVE: Projects Map
//
// -----------------------------------------------------------------------------------
directiveProjectsMap.$inject = [];
/* @ngInject */
function directiveProjectsMap() {
	var directive = {
		restrict: 'E',
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
// DIRECTIVE: Projects Intake
//
// -----------------------------------------------------------------------------------
directiveProjectsIntake.$inject = [];
/* @ngInject */
function directiveProjectsIntake() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/projects-partials/projects-intake.html',
		controller: 'controllerProjectsIntake',
		controllerAs: 'projectIntakeList',
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
directiveProjectsFilterBar.$inject = [];
/* @ngInject */
function directiveProjectsFilterBar() {
	var directive = {
		restrict: 'E',
		replace: true,
		scope: {
			data: '='
		},
		templateUrl: 'modules/projects/client/views/projects-partials/projects-filter-bar.html',
		controller: 'controllerProjectsFilterBar',
		controllerAs: 'fbc'
	};
	return directive;
}
