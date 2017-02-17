'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_', 'RELEASE', 'ENV',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _, RELEASE, ENV) {
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
				cache: false,
				resolve: {
					projects: function ($stateParams, ProjectModel) {
						return ProjectModel.published ();
					}
				},
				controller: function ($cookies, Utils, $scope, $stateParams, ENV, projects, Authentication, Application) {
					$scope.projects = projects;
					$scope.environment = ENV;
					$scope.authentication = Authentication;
					$scope.Application = Application;
					$scope.filterObj = {};
					$scope.seenOnce = $cookies.get('seenOnce');
					if (!$scope.seenOnce) {
						// console.log("Haven't seen you before.");
						var now = new Date();
						$cookies.put('seenOnce', true, {expires: new Date(now.getFullYear()+1, now.getMonth(), now.getDate())});
					} else {
						// console.log("Welcome back.");
					}
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
