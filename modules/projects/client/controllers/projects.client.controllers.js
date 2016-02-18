'use strict';

angular.module('projects')
	// General
	.controller('controllerProjects', controllerProjects)
	.controller('controllerProjectsList', controllerProjectsList)
	.controller('controllerUserActivities', controllerUserActivities);

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
function controllerProjectsList($scope, $state, Authentication, sProjectModel, $rootScope) {
	var projectList = this;

	projectList.refresh = function() {
		sProjectModel.getCollection().then( function(data) {
			projectList.projects = data;
			$scope.$apply ();
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

// -----------------------------------------------------------------------------------
//
// CONTROLLER: User Activities
//
// -----------------------------------------------------------------------------------
controllerUserActivities.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', 'ActivityModel', '$rootScope', '_'];
/* @ngInject */
function controllerUserActivities($scope, $state, Authentication, sProjectModel, sActivityModel, $rootScope, _) {
	var userActs = this;
	userActs.projectNames = {};

	userActs.refresh = function() {
		sActivityModel.userActivities(undefined, 'read').then( function(data) {
			userActs.activities = data;
			$scope.$apply ();
		}).catch( function(err) {
			$scope.error = err;
		});
	};

	sProjectModel.getCollection().then( function(data) {
		userActs.projects = data;

		// reference the ID and the name.
		_.each(data, function(project) {
			userActs.projectNames[project._id] = project.name;
		});

	});

	userActs.refresh();
}


