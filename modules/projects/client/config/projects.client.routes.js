'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

	$stateProvider
	// =========================================================================
	//
	// New Project Routes
	//
	// =========================================================================
	.state('projects', {
		url: '/',
		templateUrl: 'modules/projects/client/views/projects.abstract.html',
		resolve: {
			projects: function ($stateParams, ProjectModel) {
				return ProjectModel.published ();
			}
		},
		controller: function ($scope, $stateParams, projects, ENV, Authentication, Application) {
			$scope.projects = projects;
			$scope.environment = ENV;
			$scope.authentication = Authentication;
			$scope.Application = Application;
			$scope.filterObj = {};
		}
	})
	// -------------------------------------------------------------------------
	//
	// the scheudle view for all projects
	//
	// -------------------------------------------------------------------------
	.state('projects.schedule', {
		data: {roles: ['admin', '*:*:responsible-epd','*:*:project-admin', '*:*:project-lead','*:*:project-team','*:*:project-intake', '*:*:assistant-dm', '*:*:associate-dm', '*:*:minister-office', '*:*:qa-officer', '*:*:ce-lead', '*:*:ce-officer', '*:*:wg', '*:*:ceaa', '*:pro:admin', '*:pro:member', '*:*:sub']},
		url: 'schedule',
		templateUrl: 'modules/projects/client/views/projects-partials/projects-schedule.html',
		controller: function ($scope, projects) {
			$scope.projects = projects;
			$scope.allPhases = _.sortBy(_.unique(_.flatten(_.map(projects, function(proj) {
				return _.map(proj.phases, 'name');
			}))));
		}
	});
}]);
