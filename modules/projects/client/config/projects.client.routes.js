'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_', 'RELEASE',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _, RELEASE) {
		if (RELEASE.redirectHomepageToGeorgeMassey) {
			$stateProvider
			.state('projects', {
				url: '/',
				controller: function ($state) {
					$state.transitionTo('p.commentperiod.detail', { projectid:'george-massey-tunnel-replacement', periodId:'57a125f88b42220c00d87276'}, {
						reload: true, inherit: false, notify: true
					});
				}
			});
		} else {
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
				data: {},
				url: 'schedule',
				templateUrl: 'modules/projects/client/views/projects-partials/projects-schedule.html',
				controller: function ($scope, projects) {
					$scope.projects = projects;
					$scope.allPhases = _.sortBy(_.unique(_.flatten(_.map(projects, function(proj) {
						return _.map(proj.phases, 'name');
					}))));
				}
			});
		}
}]);
