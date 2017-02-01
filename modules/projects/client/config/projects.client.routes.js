'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
		$stateProvider

		// Project List Page (Mine List)
		.state('projects', {
			url: '/',
			templateUrl: 'modules/projects/client/views/projects.abstract.html',
			resolve: {
				projects: function ($stateParams, ProjectModel) {
					return ProjectModel.published ();
				}
			},
			controller: function (Utils, $scope, $stateParams, ENV, projects, Authentication, Application) {
				$scope.projects = projects;
				$scope.environment = ENV;
				$scope.authentication = Authentication;
				$scope.Application = Application;
				$scope.filterObj = {};
			}
		});
	}]);
