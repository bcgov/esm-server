'use strict';
// =========================================================================
//
// prototype routes (under admin)
//
// =========================================================================
angular.module('prototype').config(['$stateProvider', '_', function ($stateProvider, _) {

	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for orgs.
	// we resolve prototype to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.prototype', {
		data: {roles: ['admin', 'prototype']},
		abstract:true,
		url: '/prototype',
		template: '<ui-view></ui-view>',
		resolve: {
			data: function(PrototypeModel) {
				return PrototypeModel.getData();
			},
			agencies: function(data) {
				return data.agencies;
			},
			inspectionsText: function(data) {
				return data.inspectionsText;
			},
			inspections: function(data, inspectionsText) {
				var inspections = data.inspections;
				_.each(inspectionsText, function(txt) {
					var inspection = _.find(inspections, function(x) { return txt.inspectionId === x.inspectionId; });
					if (inspection) {
						inspection.followupText = txt.followupText;
					}
				});
				return inspections;
			},
			projects: function(data) {
				return data.projects;
			},
			cedetails: function(data) {
				return data.cedetails;
			},
			authorizations: function(data) {
				return data.authorizations;
			},
			phases: function(data) {
				return data.phases;
			},
			actionsText: function(data) {
				return data.actionsText;
			},
			actionsResponseText: function(data) {
				return data.actionsResponseText;
			},
			actionsFollowupText: function(data) {
				return data.actionsFollowupText;
			},
			actions: function(data, actionsText, actionsResponseText, actionsFollowupText) {
				var actions = data.actions;
				_.each(actionsText, function(txt) {
					var action = _.find(actions, function(x) { return txt.orderId === x.orderId; });
					if (action) {
						action.text = txt.text;
					}
				});
				_.each(actionsResponseText, function(txt) {
					var action = _.find(actions, function(x) { return txt.orderId === x.orderId; });
					if (action) {
						action.responseText = txt.responseText;
					}
				});
				_.each(actionsFollowupText, function(txt) {
					var action = _.find(actions, function(x) { return txt.orderId === x.orderId; });
					if (action) {
						action.followupText = txt.followupText;
					}
				});
				return actions;
			},
			conditionsText: function(data) {
				return data.conditionsText;
			},
			conditions: function(data, conditionsText) {
				var conditions = data.conditions;
				_.each(conditionsText, function(txt) {
					var condition = _.find(conditions, function(x) { return txt.conditionId === x.conditionId; });
					if (condition) {
						condition.conditionText = txt.conditionText;
					}
				});
				return conditions;
			},
			documents: function(data) {
				return data.documents;
			},
			topics: function(data, inspections, conditions, actions) {
				var topicsList = data.topics;
				var subtopicsList = data.subTopics;

				var topics = _.filter(topicsList, function(t) { return t.active === 'Y';});
				var subTopics = _.filter(subtopicsList, function(t) { return t.active === 'Y';});
				_.each(topics, function(topic) {
					// find all inspections with this topic....
					// find all conditions...
					// find all actions...
					topic.inspections =  _.filter(inspections, function(x) { return _.includes(x.topics, topic.name); }) || [];
					topic.conditions =  _.filter(conditions, function(x) { return _.includes(x.topics, topic.name); }) || [];
					topic.actions =  _.filter(actions, function(x) { return _.includes(x.topics, topic.name); }) || [];

					// do the same for each subtopic...
					var subs = _.filter(subTopics, function(sub) { return sub.topicId === topic.topicId; });
					_.each(subs, function(sub) {
						sub.inspections =  _.filter(inspections, function(x) { return _.includes(x.topics, sub.name); }) || [];
						sub.conditions =  _.filter(conditions, function(x) { return _.includes(x.topics, sub.name); }) || [];
						sub.actions =  _.filter(actions, function(x) { return _.includes(x.topics, sub.name); }) || [];
					});
					// add the subtopics to this topic....
					topic.subtopics = subs || [];
				});

				// need counts for inspections conditions actions for topics and subtopics...


				return topics;
			},
			project: function (agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents) {
				var result = _.find(projects, function(i) { return i.name === "Mount Milligan Mine"; });
				result.ceDetails = _.find(cedetails, function(x) { return x.projectId === result.projectId; });

				// inspections
				result.inspections = _.filter(inspections, function(a) {
					return a.projectId === result.projectId;
				});

				// phases
				result.phases = _.filter(phases, function(a) {
					return a.projectId === result.projectId;
				});

				// conditions
				result.conditions = _.filter(conditions, function(a) {
					return a.projectId === result.projectId;
				});

				// actions
				result.actions = _.filter(actions, function(a) {
					return a.projectId === result.projectId;
				});

				result.documents = _.filter(documents, function(a) {
					return a.projectId === result.projectId;
				});

				result.authorizations = _.filter(authorizations, function(a) {
					return a.projectId === result.projectId;
				});

				result.groupedAuthorizations = [];
				var groupedauthorizations = _.groupBy(result.authorizations, function(g) { return g.name;});
				_.each(groupedauthorizations, function(x) {
					var sorted = _.sortBy(x, function(y) { return y.date;});
					var latest = _.last(sorted);
					result.groupedAuthorizations.push(latest);
				});
				return result;
			}
		}
	})
	// PROJECT MAIN
	.state('admin.prototype.projectmain', {
		url: '/project-main',
		resolve: {},
		templateUrl: 'modules/prototype/client/views/project-main.html',
		controller: function ($modal, $window, $timeout, $scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, uiGmapGoogleMapApi) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topics = topics;
		},
	})

	// AUTHORIZATIONS
	.state('admin.prototype.authorizations', {
		url: '/authorizations',
		resolve: {},
		templateUrl: 'modules/prototype/client/views/authorizations.html',
		controller: function ($modal, $window, $timeout, $scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, uiGmapGoogleMapApi) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topics = topics;
		},
	})


	.state('admin.prototype.map', {
		url: '/map',
		resolve: {},
		templateUrl: 'modules/prototype/client/views/map.html',
		controller: function (uiGmapIsReady, $scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, uiGmapGoogleMapApi) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topics = topics;

			var mpl = {};
			mpl.center = {latitude: 55.119973, longitude: -124.012351};
			mpl.layers = {};
			mpl.markers = [];
			mpl.KMLLayers = [];
			mpl.projectFiltered = [];

			mpl.map = {
				center: {latitude: 55.119973, longitude: -124.012351},
				zoom: 12,
				options: {
					scrollwheel: false,
					minZoom: 4
				},
				markers: mpl.projectFiltered // array of models to display
			};

			mpl.map.markers.push({
				id: 12345,
				latitude: 55.119973,
				longitude: -124.012351
			});

			mpl.map.markers.push({
				id: 12345,
				latitude: 54.119973,
				longitude: -124.012351
			});

			mpl.KMLLayers.push(
				{	url: "https://mem-mmt-test.pathfinder.gov.bc.ca/api/document/582b923b48077f0017feb5ee/fetch",
					label: "ADMIN",
					show: true,
					_id: 654654
				});
			mpl.KMLLayers.push(
				{	url: "https://mem-mmt-test.pathfinder.gov.bc.ca/api/document/582b923b48077f0017feb608/fetch",
					label: "Disturbance",
					show: true,
					_id: 654655
				});
			mpl.KMLLayers.push(
				{	url: "https://mem-mmt-test.pathfinder.gov.bc.ca/api/document/582b923b48077f0017feb5fb/fetch",
					label: "Plantsite",
					show: true,
					_id: 654656
				});
			mpl.KMLLayers.push(
				{	url: "https://mem-mmt-test.pathfinder.gov.bc.ca/api/document/582b923b48077f0017feb609/fetch",
					label: "Stockpiles",
					show: true,
					_id: 654657
				});
			mpl.KMLLayers.push(
				{	url: "https://mem-mmt-test.pathfinder.gov.bc.ca/api/document/582b923b48077f0017feb5e1/fetch",
					label: "TSF",
					show: true,
					_id: 654658
				});

			$scope.mpl = mpl;

			$scope.initMap = function (map) {
				var legend = document.getElementById('legend');
				var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
				var icons = {
		          admin: {
		            name: 'ADMIN',
					color: '#D4E4F3'
		          },
		          disturbance: {
		            name: 'Disturbance',
					color: '#A77000'
		          },
		          plantsite: {
		            name: 'Plantsite',
					color: '#B2B2B2'
		          },
		          stockpiles: {
		            name: 'Stockpiles',
					color: '#70A700'
		          },
		          tsf: {
		            name: 'TSF',
					color: '#FFAA00'
		          }
		        };
		        for (var key in icons) {
		          var type = icons[key];
		          var name = type.name;
		          var icon = type.icon;
		          var div = document.createElement('div');
		          div.innerHTML = '<div class="legend-item"><div class="swatch" style="background-color: ' + type.color + ' " ></div>' + '<div class="layer-name">' + type.name + '</div></div>';
		          legend.appendChild(div);
		        }
			};

			uiGmapIsReady.promise()
			.then(function (instances) {
			    angular.forEach(instances, function (value, key) {
			        var theMap = value.map;
			        $scope.initMap(theMap);
			    });
			});
		},
	})

	// ACTIONS MAIN 
	.state('admin.prototype.actions', {
		url: '/actions',
		templateUrl: 'modules/prototype/client/views/actions-main.html',
		controller: function ($scope, $filter, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;

			$scope.actions = _.filter(actions, function(x) { return x.projectId === project.projectId; });


			$scope.keywords = undefined;

			$scope.topicEnvironment = false;
			$scope.topicCommunities = false;
			$scope.topicHeritage = false;
			$scope.topicHealth = false;
			$scope.topics = [];

			$scope.filter = {
				failed: undefined
			};

			$scope.tableParamsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParams =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filter
			}, {
				debugMode: false,
				total: $scope.actions.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.actions, params.orderBy()) : $scope.actions;
					orderedData	= $filter('filter')(orderedData, params.filter());
					//orderedData	= $filter('keywordsFilter')(orderedData, $scope.keywords);
					orderedData	= $filter('topicsFilter')(orderedData, $scope.topics);
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsStats.currentPage = params.page();
					$scope.tableParamsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsStats.first = ($scope.filteredCount === 0) ? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsStats.totalCount =  params.total();
					$scope.tableParamsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSize = 10;

			$scope.changePageSize = function(newSize){
				$scope.tableParams.count(newSize);
			};

			$scope.clearFilter = function() {
				$scope.keywords = undefined;

				$scope.topicEnvironment = false;
				$scope.topicCommunities = false;
				$scope.topicHeritage = false;
				$scope.topicHealth = false;
				$scope.topics = [];

				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			};
			$scope.applyFilter = function() {

				$scope.topics = [];
				if ($scope.topicEnvironment) $scope.topics.push('Environment');
				if ($scope.topicCommunities) $scope.topics.push('Communities');
				if ($scope.topicHeritage) $scope.topics.push('Heritage');
				if ($scope.topicHealth) $scope.topics.push('Health and Safety');

				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			};
		},
	})

	// COMPLIANCE & ENFORCEMENT MAIN 
	.state('admin.prototype.cemain', {
		url: '/compliance-and-enforcement',
		templateUrl: 'modules/prototype/client/views/ce-main.html',
		controller: function ($scope, $filter, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

			$scope.filterInspections = {
				failed: undefined
			};

			$scope.tableParamsInspectionsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.filterActions = {
				failed: undefined
			};

			$scope.tableParamsActionsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParamsInspections =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filterInspections
			}, {
				debugMode: false,
				total: $scope.project.inspections,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.project.inspections, params.orderBy()) : $scope.project.inspections;
					orderedData	= $filter('filter')(orderedData, params.filter());
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsInspectionsStats.currentPage = params.page();
					$scope.tableParamsInspectionsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsInspectionsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsInspectionsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsInspectionsStats.totalCount =  params.total();
					$scope.tableParamsInspectionsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSizeInspections = 10;

			$scope.changePageSizeInspections = function(newSize){
				$scope.tableParamsInspections.count(newSize);
			};

			$scope.tableParamsActions =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filterActions
			}, {
				debugMode: false,
				total: $scope.project.actions,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.project.actions, params.orderBy()) : $scope.project.actions;
					orderedData	= $filter('filter')(orderedData, params.filter());
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsActionsStats.currentPage = params.page();
					$scope.tableParamsActionsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsActionsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsActionsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsActionsStats.totalCount =  params.total();
					$scope.tableParamsActionsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSizeActions = 10;

			$scope.changePageSizeActions = function(newSize){
				$scope.tableParamsActions.count(newSize);
			};
		},
	})

	// INSPECTION PAGE
	.state('admin.prototype.inspection', {
		url: '/inspection/:inspectionId',
		templateUrl: 'modules/prototype/client/views/ce-inspection.html',
		resolve: {
			inspection: function (project, $stateParams) {
				var result = _.find(project.inspections, function(i) { return i.inspectionId === $stateParams.inspectionId; });
				return result;
			}
		},
		controller: function ($scope, $filter, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, inspection) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;
			$scope.inspection = inspection;
			$scope.inspectionActions = _.filter(project.actions, function(a) { return a.inspectionId === inspection.inspectionId; });

			$scope.filter = {
				failed: undefined
			};

			$scope.tableParamsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParams =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filter
			}, {
				debugMode: false,
				total: $scope.inspectionActions.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.inspectionActions, params.orderBy()) : $scope.inspectionActions;
					orderedData	= $filter('filter')(orderedData, params.filter());
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsStats.currentPage = params.page();
					$scope.tableParamsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsStats.totalCount =  params.total();
					$scope.tableParamsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSize = 10;

			$scope.changePageSize = function(newSize){
				$scope.tableParams.count(newSize);
			};

		},
	})

	// ACTION 
	.state('admin.prototype.action', {
		url: '/action/:orderId',
		templateUrl: 'modules/prototype/client/views/ce-action.html',
		resolve: {
			action: function (project, $stateParams) {
				var result = _.find(project.actions, function(i) { return i.orderId === $stateParams.orderId; });
				return result;
			},
			inspection: function (project, action) {
				var result = _.find(project.inspections, function(i) { return i.inspectionId === action.inspectionId; });
				return result;
			}
		},
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, action, inspection) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;
			$scope.action = action;
			$scope.inspection = inspection;
		},
	})

	// CONDITIONS
	.state('admin.prototype.conditionsmain', {
		url: '/conditions',
		templateUrl: 'modules/prototype/client/views/conditions-main.html',
		controller: function ($scope, $filter, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.conditions = _.filter(conditions, function(x) { return x.projectId === project.projectId; });

			$scope.keywords = undefined;

			$scope.topicEnvironment = false;
			$scope.topicCommunities = false;
			$scope.topicHeritage = false;
			$scope.topicHealth = false;
			$scope.topics = [];


			$scope.filter = {
				failed: undefined
			};

			$scope.tableParamsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParams =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filter
			}, {
				debugMode: false,
				total: $scope.conditions.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.conditions, params.orderBy()) : $scope.conditions;
					orderedData	= $filter('filter')(orderedData, params.filter());
					//orderedData	= $filter('keywordsFilter')(orderedData, $scope.keywords);
					orderedData	= $filter('topicsFilter')(orderedData, $scope.topics);
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsStats.currentPage = params.page();
					$scope.tableParamsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsStats.totalCount =  params.total();
					$scope.tableParamsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

				}
			});

			$scope.pageSize = 10;

			$scope.changePageSize = function(newSize){
				$scope.tableParams.count(newSize);
			};

			$scope.clearFilter = function() {
				$scope.keywords = undefined;

				$scope.topicEnvironment = false;
				$scope.topicCommunities = false;
				$scope.topicHeritage = false;
				$scope.topicHealth = false;
				$scope.topics = [];

				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			};
			$scope.applyFilter = function() {

				$scope.topics = [];
				if ($scope.topicEnvironment) $scope.topics.push('Environment');
				if ($scope.topicCommunities) $scope.topics.push('Communities');
				if ($scope.topicHeritage) $scope.topics.push('Heritage');
				if ($scope.topicHealth) $scope.topics.push('Health and Safety');

				$scope.tableParams.page(1);
				$scope.tableParams.reload();
			};
		},
	})

	// CONDITION
	.state('admin.prototype.condition', {
		url: '/condition/:conditionId',
		resolve: {
			condition: function (project, $stateParams) {
				var result = _.find(project.conditions, function(i) { return i.conditionId === $stateParams.conditionId; });
				return result;
			}
		},
		templateUrl: 'modules/prototype/client/views/condition.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, condition) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.condition = condition;

			// get supporting documents for condition
			$scope.condition.supportDocuments = _.filter(documents, function(x) { return x.conditionId === condition.conditionId; });
		},
	})

	// TOPIC 
	.state('admin.prototype.topic', {
		url: '/topic/:topicId',
		resolve: {
			topic: function (topics, $stateParams) {
				var result = _.find(topics, function(i) { return i.topicId === $stateParams.topicId; });
				return result;
			}
		},
		templateUrl: 'modules/prototype/client/views/topic.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, topic) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topic = topic;
		},
	})

	// SUBTOPIC 
	.state('admin.prototype.subtopic', {
		url: '/topic/:topicId/subtopic/:subtopicId',
		resolve: {
			topic: function (topics, $stateParams) {
				var result = _.find(topics, function(i) { return i.topicId === $stateParams.topicId; });
				return result;
			},
			subtopic: function (topic, $stateParams) {
				var result = _.find(topic.subtopics, function(i) { return i.topicId === $stateParams.topicId && i.subtopicId === $stateParams.subtopicId; });
				return result;
			}
		},
		templateUrl: 'modules/prototype/client/views/subtopic.html',
		controller: function ($scope, $filter, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, topic, subtopic) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topic = topic;
			$scope.subtopic = subtopic;

			$scope.filterConditions = {
				failed: undefined
			};
			$scope.filterInspections = {
				failed: undefined
			};
			$scope.filterActions = {
				failed: undefined
			};

			$scope.tableParamsConditionsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParamsConditions =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filterConditions
			}, {
				debugMode: false,
				total: $scope.subtopic.conditions.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.subtopic.conditions, params.orderBy()) : $scope.subtopic.conditions;
					orderedData	= $filter('filter')(orderedData, params.filter());
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsConditionsStats.currentPage = params.page();
					$scope.tableParamsConditionsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsConditionsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsConditionsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsConditionsStats.totalCount =  params.total();
					$scope.tableParamsConditionsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSizeConditions = 10;

			$scope.changePageSizeConditions = function(newSize){
				$scope.tableParamsConditions.count(newSize);
			};

			$scope.tableParamsInspectionsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParamsInspections =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filterInspections
			}, {
				debugMode: false,
				total: $scope.subtopic.inspections.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.subtopic.inspections, params.orderBy()) : $scope.subtopic.inspections;
					orderedData	= $filter('filter')(orderedData, params.filter());
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsInspectionsStats.currentPage = params.page();
					$scope.tableParamsInspectionsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsInspectionsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsInspectionsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsInspectionsStats.totalCount =  params.total();
					$scope.tableParamsInspectionsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSizeInspections = 10;

			$scope.changePageSizeInspections = function(newSize){
				$scope.tableParamsInspections.count(newSize);
			};

			$scope.tableParamsActionsStats = {
				currentPage: 0,
				totalPages: 0,
				first: 0,
				last: 0,
				totalCount: 0,
				filteredCount: 0
			};

			$scope.tableParamsActions =  new NgTableParams({
				page: 1,
				count: 10,
				filter: $scope.filterActions
			}, {
				debugMode: false,
				total: $scope.subtopic.actions.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ? $filter('orderBy')($scope.subtopic.actions, params.orderBy()) : $scope.subtopic.actions;
					orderedData	= $filter('filter')(orderedData, params.filter());
					params.total(orderedData.length);
					$scope.filteredCount = orderedData.length;

					$scope.tableParamsActionsStats.currentPage = params.page();
					$scope.tableParamsActionsStats.totalPages = (params.count() > 0) ? Math.ceil(params.total() / params.count()): 0;
					$scope.tableParamsActionsStats.first = ($scope.filteredCount === 0)? 0 : ((params.page()-1) * params.count()) + 1;
					$scope.tableParamsActionsStats.last = (params.page() * params.count() > params.total()) ? params.total() : params.page() * params.count();
					$scope.tableParamsActionsStats.totalCount =  params.total();
					$scope.tableParamsActionsStats.filteredCount = $scope.filteredCount;

					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});

			$scope.pageSizeActions = 10;

			$scope.changePageSizeActions = function(newSize){
				$scope.tableParamsActions.count(newSize);
			};

		}
	});


}]);