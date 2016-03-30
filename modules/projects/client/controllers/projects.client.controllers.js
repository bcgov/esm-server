'use strict';

angular.module('projects')
	// General
	.controller('controllerProjectsList', controllerProjectsList)
	.controller('controllerProjectsList2', controllerProjectsList2)
	.controller('controllerProjectsSearch', controllerProjectsSearch);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects
//
// -----------------------------------------------------------------------------------
controllerProjectsSearch.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', '$rootScope', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC', 'PhaseBaseModel'];
/* @ngInject */
function controllerProjectsSearch($scope, $state, Authentication, sProjectModel, $rootScope, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC, sPhaseBaseModel) {
	var projectsSearch = this;

	sPhaseBaseModel.getCollection().then( function(data) {
		projectsSearch.phases = data;
	});
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
		// console.log(query);
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
controllerProjectsList.$inject = ['$scope', '$state', 'Authentication', '$rootScope', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC', '_'];
/* @ngInject */
function controllerProjectsList($scope, $state, Authentication, $rootScope, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC, _) {
	var projectList = this;

	// NgMap.getMap().then(function(map) {
	// 	projectList.map = map;
	// });

	projectList.types = PROJECT_TYPES;
	projectList.regions = REGIONS;
	projectList.status = PROJECT_STATUS_PUBLIC;

	// projectList.showMarker = function(evt, markerId) {
	// 	projectList.mark = _.find(projectList.projects, '_id', markerId);
	// 	console.log(projectList.mark);
	// 	projectList.map.showInfoWindow('info-map-win', this);
 // 	};

	projectList.auth = Authentication;

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			projectList.projects = newValue;
			var projs = _(projectList.projects).chain().flatten();
			projectList.regions = projs.pluck('region').unique().value();
			projectList.status = projs.pluck('status').unique().value();
			projectList.types = projs.pluck('type').unique().value();
		}
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects List 2
//
// -----------------------------------------------------------------------------------
controllerProjectsList2.$inject = ['$scope', 'NgTableParams', '$state', 'Authentication', 'ProjectModel', '$rootScope', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_ARRAY', 'ENV'];
/* @ngInject */
function controllerProjectsList2($scope, NgTableParams, $state, Authentication, sProjectModel, $rootScope, PROJECT_TYPES, REGIONS, PROJECT_STATUS_ARRAY, ENV) {
	var projectList = this;

	$scope.environment = ENV;

	projectList.types = PROJECT_TYPES.map (function (e) {
		return {id:e,title:e};
	});
	projectList.regions = REGIONS;
	projectList.status = PROJECT_STATUS_ARRAY.map (function (e) {
		return {id:e,title:e};
	});

	projectList.auth = Authentication;

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			projectList.tableParams = new NgTableParams ({count: 10}, {dataset: newValue});
			// projectList.projects = newValue;
		}
	});

}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: User Activities
//
// -----------------------------------------------------------------------------------
// controllerUserActivities.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', 'ActivityModel', '$rootScope', '_'];
// /* @ngInject */
// function controllerUserActivities($scope, $state, Authentication, sProjectModel, sActivityModel, $rootScope, _) {
// 	var userActs = this;
// 	userActs.projectNames = {};

// 	userActs.refresh = function() {
// 		sActivityModel.userActivities(undefined, 'read').then( function(data) {
// 			userActs.activities = data;
// 			$scope.$apply ();
// 		}).catch( function(err) {
// 			$scope.error = err;
// 		});
// 	};

// 	sProjectModel.getCollection().then( function(data) {
// 		userActs.projects = data;

// 		// reference the ID and the name.
// 		_.each(data, function(project) {
// 			userActs.projectNames[project._id] = {'name': project.name, 'region': project.region};
// 		});
// 		$scope.$apply();
// 	});

// 	userActs.refresh();
// }


