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
controllerProjects.$inject = ['$scope', '$state', '$rootScope', 'ProjectModel', 'PROJECT_TYPES', 'Authentication'];
/* @ngInject */
function controllerProjects($scope, $state, $rootScope, sProjectModel, PROJECT_TYPES, Authentication) {
	var projects = this;

	projects.types = PROJECT_TYPES;

	projects.authentication = Authentication;

	projects.refresh = function() {
		sProjectModel.getCollection().then( function(data) {
			projects.projects = data;
			$scope.$apply ();
		}).catch( function(err) {
			$scope.error = err;
		});
	};

	$rootScope.$on('refreshProjectsList', function() {
		projects.refresh();
	});

	projects.refresh();


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
		if (projectsSearch.search.keywords) {
			query.keywords = {'$in': projectsSearch.search.keywords.split(' ') };
		}
		console.log(query);
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
controllerProjectsList.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', '$rootScope', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC'];
/* @ngInject */
function controllerProjectsList($scope, $state, Authentication, sProjectModel, $rootScope, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC) {
	var projectList = this;

	projectList.types = PROJECT_TYPES;
	projectList.regions = REGIONS;
	projectList.status = PROJECT_STATUS_PUBLIC;

	projectList.auth = Authentication;

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			projectList.projects = newValue;
		}
	});

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


