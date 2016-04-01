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
function controllerProjectsSearch($scope, $state, Authentication, ProjectModel, $rootScope, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC, sPhaseBaseModel) {
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
		ProjectModel.getQuery (query).then( function(data) {
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
controllerProjectsList.$inject = ['$scope', 'Authentication', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC', '_', 'uiGmapGoogleMapApi', '$filter'];
/* @ngInject */
function controllerProjectsList($scope, Authentication, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC, _, uiGmapGoogleMapApi, $filter) {
	var projectList = this;

	// The "then" callback function provides the google.maps object.
	uiGmapGoogleMapApi.then(function(maps) {
		projectList.map = {
			center: {
				latitude: 54.726668,
				longitude: -127.647621
			},
			zoom: 5,
			options: {
				scrollwheel: false,
				minZoom: 4
			},
			markers: projectList.projectsFiltered, // array of models to display
			markersEvents: {
				click: function(marker, eventName, model) {
					projectList.map.window.model = model;
					projectList.map.window.show = true;
				}
			},
			window: {
				marker: {},
				show: false,
				closeClick: function() {
					this.show = false;
				},
				options: {
					// offset to fit the custom icon
    					pixelOffset: new maps.Size(0, -35, 'px', 'px')
				} // define when map is ready
			}
		};
	});


	projectList.showInfoWindow = function(marker, event, model) {
		$scope.infoWin = model;
		$scope.infoWin.show = true;
	};


	$scope.$watchGroup(['filterType', 'filterStatus', 'filterRegion'], function(newValues){
		var filterObj = {};
		// type
		if (newValues[0]) {
			filterObj.type = newValues[0];
		}
		// type
		if (newValues[1]) {
			filterObj.status = newValues[1];
		}
		// type
		if (newValues[2]) {
			filterObj.region = newValues[2];
		}

		projectList.projectsFiltered = $filter("filter")(projectList.projects, filterObj);
     	if (!projectList.projectsFiltered){
     		return;
		}
   });



	projectList.types = PROJECT_TYPES;
	projectList.regions = REGIONS;
	projectList.status = PROJECT_STATUS_PUBLIC;


	projectList.auth = Authentication;

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			projectList.projects = newValue;
			var projs = _(projectList.projects).chain().flatten();
			// add a pos for the map display
			projectList.projects = _.map(projectList.projects, function(item) {
				item.latitude = item.lat;
				item.longitude = item.lon;
				return item;
			});

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
controllerProjectsList2.$inject = ['$scope', 'NgTableParams', 'Authentication', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_ARRAY', 'ENV'];
/* @ngInject */
function controllerProjectsList2($scope, NgTableParams, Authentication, PROJECT_TYPES, REGIONS, PROJECT_STATUS_ARRAY, ENV) {
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
// function controllerUserActivities($scope, $state, Authentication, ProjectModel, sActivityModel, $rootScope, _) {
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

// 	ProjectModel.getCollection().then( function(data) {
// 		userActs.projects = data;

// 		// reference the ID and the name.
// 		_.each(data, function(project) {
// 			userActs.projectNames[project._id] = {'name': project.name, 'region': project.region};
// 		});
// 		$scope.$apply();
// 	});

// 	userActs.refresh();
// }


