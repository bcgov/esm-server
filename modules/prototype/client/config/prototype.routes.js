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
			topics: function(data) {
				return data.topics;
			},
			subTopics: function(data) {
				return data.subTopics;
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
			inspections: function(data) {
				return data.inspections;
			},
			actions: function(data) {
				return data.actions;
			},
			conditions: function(data) {
				return data.conditions;
			},
			documents: function(data) {
				return data.documents;
			},
			project: function (agencies, topics, subTopics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents) {
				var result = _.find(projects, function(i) { return i.name === "Mount Milligan Mine"; });


				result.ceDetails = _.find(cedetails, function(x) { return x.project === result.name; });

				// inspections
				result.inspections = _.filter(inspections, function(a) {
					return a.project === result.name;
				});

				// phases
				result.phases = _.filter(phases, function(a) {
					return a.project === result.name;
				});

				// actions
				result.actions = _.filter(actions, function(a) {
					return a.project === result.name;
				});

				result.authorizations = _.filter(authorizations, function(a) {
					return a.project === result.name;
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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, subTopics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, uiGmapGoogleMapApi) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

			var mpl = {};
			mpl.center = {latitude: 54.726668, longitude: -122.647621};
			mpl.layers = {};
			mpl.markers = [];
			mpl.KMLLayers = [];
			mpl.projectFiltered = [];

			mpl.map = {
				center: {latitude: 54.726668, longitude: -127.647621},
				zoom: 12,
				options: {
					scrollwheel: false,
					minZoom: 4
				},
				markers: mpl.projectFiltered // array of models to display
			};

			mpl.map.markers.push({
				id: 12345,
				latitude: 54.726668,
				longitude: -127.647621
			});

			// var kmlURL = window.location.protocol + "//" + window.location.host + "/api/document/" + doc._id + "/fetch";
			var kmlURL = "http://www.google.com/file.kml";
			mpl.KMLLayers.push({
				url: kmlURL,
				label: "doc.internalOriginalName",
				show: true,
				_id: 654654
			});

			$scope.mpl = mpl;
		},
	})

	// COMPLIANCE & ENFORCEMENT MAIN 
	.state('admin.prototype.cemain', {
		url: '/compliance-and-enforcement',
		templateUrl: 'modules/prototype/client/views/ce-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, subTopics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project, inspection) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;
			$scope.inspection = inspection;
			$scope.inspectionActions = _.filter(project.actions, function(a) { return a.inspectionId === inspection.inspectionId; });
		},
	})

	// ACTION 
	.state('admin.prototype.action', {
		url: '/action/:actionId',
		templateUrl: 'modules/prototype/client/views/ce-action.html',
		resolve: {
			action: function (project, $stateParams) {
				var result = _.find(project.actions, function(i) { return i._id === $stateParams.actionId; });
				return result;
			},
			inspection: function (project, action) {
				var result = _.find(project.inspections, function(i) { return i._id === action.inspectionId; });
				return result;
			}
		},
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project, action, inspection) {
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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
		},
	})

	// CONDITION
	.state('admin.prototype.condition', {
		url: '/condition/:conditionId',
		resolve: {
			condition: function (project, $stateParams) {
				var result = _.find(project.conditions, function(i) { return i._id === $stateParams.conditionId; });
				return result;
			}
		},
		templateUrl: 'modules/prototype/client/views/condition.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project, condition) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.condition = condition;
		},
	})

	// TOPIC 
	.state('admin.prototype.topic', {
		url: '/topic',
		templateUrl: 'modules/prototype/client/views/topic.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

		},
	})

	// SUBTOPIC 
	.state('admin.prototype.subtopic', {
		url: '/subtopic',
		templateUrl: 'modules/prototype/client/views/subtopic.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

		}
	});


}]);