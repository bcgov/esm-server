'use strict';

angular.module('project').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
		$stateProvider

		// Project List Page (Mine List)
		.state('project', {
			url: '/mine',
			templateUrl: 'modules/projects/client/views/project.abstract.html',
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
