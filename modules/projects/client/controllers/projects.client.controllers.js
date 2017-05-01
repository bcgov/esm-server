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
controllerProjectsSearch.$inject = ['$scope', '$state', 'Authentication', 'ProjectModel', '$rootScope', 'PROJECT_DECISION', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC', 'PhaseBaseModel'];
/* @ngInject */
function controllerProjectsSearch($scope, $state, Authentication, ProjectModel, $rootScope, PROJECT_DECISION, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC, sPhaseBaseModel) {
	var projectsSearch = this;

	sPhaseBaseModel.getCollection().then( function(data) {
		projectsSearch.phases = data;
	});
	projectsSearch.types = PROJECT_TYPES;
	projectsSearch.regions = REGIONS;
	projectsSearch.status = PROJECT_STATUS_PUBLIC;
	projectsSearch.eacDecision = PROJECT_DECISION;

	projectsSearch.foundSet = false;
	projectsSearch.projects = [];

	projectsSearch.resetSearch = function() {
		projectsSearch.search = undefined;
		projectsSearch.foundSet = false;
	};

	projectsSearch.performSearch = function() {
		var query = {};

		if (projectsSearch.search.Permit)  {
			query.memPermitID = projectsSearch.search.Permit;
		}
		if (projectsSearch.search.type)  {
			query.type = projectsSearch.search.type;
		}
		if (projectsSearch.search.region)  {
			query.region = projectsSearch.search.region;
		}
		if (projectsSearch.search.status)  {
			query.status = projectsSearch.search.status;
		}
		if (projectsSearch.search.eacDecision)  {
			query.eacDecision = projectsSearch.search.eacDecision;
		}
		if (projectsSearch.search.keywords) {
			query.keywords = {'$in': projectsSearch.search.keywords.split(' ') };
		}

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
controllerProjectsList.$inject = ['$scope', 'Authentication', '_', 'uiGmapGoogleMapApi', '$filter', 'CommentPeriodModel'];
/* @ngInject */
function controllerProjectsList($scope, Authentication, _, uiGmapGoogleMapApi, $filter, CommentPeriodModel) {
	var projectList = this;
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
				// Is there an open comment period?
				CommentPeriodModel.forProject(model._id)
				.then( function (periods) {
					var isOpen = false;
					_.each(periods, function (period) {
						if (period.openState.state === CommentPeriodModel.OpenStateEnum.open) {
							model.isOpen = true;
							model.period = period;
						}
					});
				});
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
					// pixelOffset: new maps.Size(0, -35, 'px', 'px')
			} // define when map is ready
		},
		clusterOptions: {
			calculator : function(markers, numStyles) {
				var changeAt = 500;
				var index = 0;
				var count = markers.length;
				var dv = count;
				while (dv !== 0) {
					dv = parseInt(dv / changeAt, 10);
					index++;
				}
				index = Math.min(index, numStyles);
				return {
					text: count,
					index: index
				};
			}
		}
	};

	projectList.showInfoWindow = function(marker, event, model) {
		$scope.infoWin = model;
		$scope.infoWin.show = true;
	};


	$scope.$parent.$watch('filterObj', function(newValue) {
		if (!_.isEmpty(newValue)) {
			projectList.projectsFiltered = $filter("filter")(projectList.projects, function (item) {
				var notFound = false;
				if ( !newValue['currentPhase.name'] || (angular.lowercase(item.currentPhase.name).indexOf(angular.lowercase(newValue['currentPhase.name']))) > -1 || item.currentPhase.name === "") {
					// console.log("cur:",item.currentPhase.name);
				} else {
					notFound = true;
				}
				if ( !newValue.region || (angular.lowercase(item.region).indexOf(angular.lowercase(newValue.region))) > -1 || item.region === "") {
					// console.log("cur:",item.region);
				} else {
					notFound = true;
				}
				if ( !newValue.type || (angular.lowercase(item.type).indexOf(angular.lowercase(newValue.type))) > -1 || item.type === "") {
					// console.log("cur:",item.type);
				} else {
					notFound = true;
				}
				if ( !newValue.name || (angular.lowercase(item.name).indexOf(angular.lowercase(newValue.name))) > -1 || item.name === "") {
					// console.log("cur:",item.name);
				} else {
					notFound = true;
				}
				if ( !newValue.memPermitID || (angular.lowercase(item.name).indexOf(angular.lowercase(newValue.memPermitID))) > -1 || item.memPermitID === "") {
					// console.log("cur:",item.name);
				} else {
					notFound = true;
				}
				if ( !newValue.eacDecision || (angular.lowercase(item.eacDecision).indexOf(angular.lowercase(newValue.eacDecision))) > -1 || item.eacDecision === "") {
					// console.log("cur:",item.eacDecision);
				} else {
					notFound = true;
				}
				if ( !newValue.openCommentPeriod || (item.openCommentPeriod === newValue.openCommentPeriod)) {
					//console.log("cur:",item.openCommentPeriod);
				} else {
					notFound = true;
				}
				if (!notFound) return item;
			});
		}
	}, true);

	projectList.clearFilter = function() {
		$scope.$parent.filterObj = undefined;
		// console.log($scope.$parent.filterObj);
	};

	// projectList.types = PROJECT_TYPES;
	// projectList.regions = REGIONS;
	// projectList.status = PROJECT_STATUS_PUBLIC;


	projectList.auth = Authentication;

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			projectList.projects = newValue;
			projectList.projectsFiltered = $filter("filter")(newValue, $scope.$parent.filterObj);
		}
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects List 2
//
// -----------------------------------------------------------------------------------
controllerProjectsList2.$inject = ['$scope', 'NgTableParams', 'Authentication', '_', 'ENV', 'PROJECT_TYPES', 'REGIONS', 'PROJECT_STATUS_PUBLIC', 'EAC_DECISIONS', '$filter'];
/* @ngInject */
function controllerProjectsList2($scope, NgTableParams, Authentication, _, ENV, PROJECT_TYPES, REGIONS, PROJECT_STATUS_PUBLIC, EAC_DECISIONS, $filter) {
	var projectList = this;

	$scope.environment = ENV;

	projectList.auth = Authentication;

	projectList.regionArray = [];
	projectList.statusArray = [];
	projectList.eacDecisionArray = [];
	projectList.typeArray = [];
	projectList.phaseArray = [];
	projectList.openPCPArray = [];

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			// add a pos for the map display
			projectList.projects = _.map(newValue, function(item) {
				item.latitude = item.lat;
				item.longitude = item.lon;
				return item;
			});

			var projs = _(angular.copy(newValue)).chain().flatten();
			projs.pluck('region').unique().value().map( function(item) {
				projectList.regionArray.push({id: item, title: $filter('regionName')(item)});
			});
			projs.pluck('status').unique().value().map( function(item) {
				projectList.statusArray.push({id: item, title: item});
			});
			//projs.pluck('eacDecision').unique().value().map( function (item) {
			//	projectList.eacDecisionArray.push({id: item, title: item});
			//});
			_.each(EAC_DECISIONS, function(item) {
				projectList.eacDecisionArray.push({id: item, title: item});
			});
			projs.pluck('type').unique().value().map( function(item) {
				projectList.typeArray.push({id: item, title: item});
			});
			projs.pluck('currentPhase.name').unique().value().map( function(item) {
				projectList.phaseArray.push({id: item, title: item});
			});
			projs.pluck('openCommentPeriod').unique().value().map( function(item) {
				if (item === "" || item === "Pending" || item === "Open" || item === "Completed") { //extract without unpublished commentPeriod
						projectList.openPCPArray.push({id: item, title: item});
				}
			});
			//avoid showing unpublished in the model in order to prevent it from appearing in home page
			_.each(newValue, function(item){
				if (item.openCommentPeriod === "Unpublished") {
					item.openCommentPeriod = "";
				}
			});

			if ($scope.$parent.filterObj) {
				projectList.tableParams = new NgTableParams ({
					count: 10,
					filter: $scope.$parent.filterObj
				}, {dataset: newValue});
			} else {
				projectList.tableParams = new NgTableParams ({
					count: 10,
				}, {dataset: newValue});
			}

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


