'use strict';

angular.module('projects').config(configFunction);

configFunction.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', '_'];

/* @ngInject */
function configFunction($locationProvider, $stateProvider, $urlRouterProvider, _) {

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
				return ProjectModel.getCollection ();
			}
		},
		controller: function ($scope, $stateParams, projects, ENV, Authentication) {
			$scope.projects = projects;
			$scope.environment = ENV;
			$scope.authentication = Authentication;
		}
	})
	// -------------------------------------------------------------------------
	//
	// the scheudle view for all projects
	//
	// -------------------------------------------------------------------------
	.state('projects.schedule', {
		url: '/schedule',
		templateUrl: 'modules/projects/client/views/projects-partials/projects.schedule.html',
		controller: function ($scope, projects) {
			$scope.projects = projects;
		}
	});
}











