'use strict';

angular.module('projects')
	// General
	.controller('controllerProjects', controllerProjects)
	.controller('controllerProjectsList', controllerProjectsList)
	.controller('controllerProjectsSearch', controllerProjectsSearch)
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
controllerProjectsSearch.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', '$rootScope', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC'];
/* @ngInject */
function controllerProjectsSearch($scope, $state, Authentication, sProjectModel, $rootScope, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC) {
	var projectsSearch = this;

	// console.log('here', PROJECT_STATUS_PUBLIC);

	projectsSearch.types = PROJECT_TYPES;
	projectsSearch.regions = REGIONS;
	projectsSearch.status = PROJECT_STATUS_PUBLIC;

	projectsSearch.foundSet = false;
	projectsSearch.projects = [];

	projectsSearch.resetSearch = function() {
		projectsSearch.search = undefined;
		projectsSearch.foundSet = false;
	};

	projectsSearch.performSearch = function() {
		var query = {};
		if (projectsSearch.search.type)  {
			query.type = projectsSearch.search.type;
		}
		if (projectsSearch.search.region)  {
			query.region = projectsSearch.search.region;
		}
		if (projectsSearch.search.status)  {
			query.status = projectsSearch.search.status;
		}

		sProjectModel.getQuery (query).then( function(data) {
			projectsSearch.projects = [];
			projectsSearch.foundSet = true;
		}).catch( function(err) {
			projectsSearch.error = err;
		});
	};

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
			userActs.projectNames[project._id] = {'name': project.name, 'region': project.region};
		});
		$scope.$apply();

	});

	userActs.refresh();
}


