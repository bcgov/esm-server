'use strict';

angular.module('projects')
	// General
	.controller('controllerProjects', controllerProjects)
	.controller('controllerProjectsList', controllerProjectsList);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Projects Main
//
// -----------------------------------------------------------------------------------
controllerProjects.$inject = ['$state', 'ProjectModel', 'PROJECT_TYPES', 'Authentication'];
/* @ngInject */
function controllerProjects($state, ProjectModel, PROJECT_TYPES, Authentication) {
	var projects = this;

	projects.types = PROJECT_TYPES;

	projects.authentication = Authentication;

	// sorting
	projects.panelSort = [
		{'field': 'name', 'name':'Name'},
		{'field': 'status', 'name':'Status'},	
		{'field': 'dateUpdated', 'name':'Date Updated'},
		{'field': 'dateCreate', 'name':'Date Created'}
	];
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects
//
// -----------------------------------------------------------------------------------
controllerProjectsList.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', '$rootScope'];
/* @ngInject */
function controllerProjectsList($scope, $state, Authentication, ProjectModel, $rootScope) {
	var projectList = this;
	
	projectList.refresh = function() {
		ProjectModel.getCollection().then( function(data) {
			projectList.projects = data;
		}).catch( function(err) {
			$scope.error = err;
		});
	};

	$rootScope.$on('refreshProjectsList', function() {
		projectList.refresh();
	});

	projectList.refresh();

	projectList.auth = Authentication;	
}
