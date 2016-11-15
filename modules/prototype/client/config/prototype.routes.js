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
				return PrototypeModel.getData() || {};
			},
			agencies: function(data) {
				return data.agencies || [];
			},
			inspectionsText: function(data) {
				return data.inspectionsText || [];
			},
			inspections: function(data, inspectionsText) {
				var inspections = data.inspections || [];
				_.each(inspectionsText, function(txt) {
					var inspection = _.find(inspections, function(x) { return txt.inspectionId === x.inspectionId; });
					if (inspection) {
						inspection.followupText = txt.followupText;
					}
				});
				return inspections;
			},
			projects: function(data) {
				return data.projects || [];
			},
			cedetails: function(data) {
				return data.cedetails || [];
			},
			authorizations: function(data) {
				return data.authorizations || [];
			},
			phases: function(data) {
				return data.phases || [];
			},
			actionsText: function(data) {
				return data.actionsText || [];
			},
			actionsResponseText: function(data) {
				return data.actionsResponseText || [];
			},
			actions: function(data, actionsText, actionsResponseText) {
				var actions = data.actions || [];
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
				return actions;
			},
			conditionsText: function(data) {
				return data.conditionsText || [];
			},
			conditions: function(data, conditionsText) {
				var conditions = data.conditions || [];
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
				var topicsList = data.topics || [];
				var subtopicsList = data.subTopics || [];

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

				if (result) {
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
				} else {
					console.log('Could not find Mount Milligan project.');
					return {};
				}
			}
		}
	})
	// PROJECT MAIN
	.state('admin.prototype.projectmain', {
		url: '/project-main',
		resolve: {},
		templateUrl: 'modules/prototype/client/views/project-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, uiGmapGoogleMapApi) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topics = topics;

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

	// ACTIONS MAIN 
	.state('admin.prototype.actions', {
		url: '/actions',
		templateUrl: 'modules/prototype/client/views/actions-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;

			$scope.actions = _.filter(actions, function(x) { return x.projectId === project.projectId; });


			// some filter actions....
		},
	})

	// COMPLIANCE & ENFORCEMENT MAIN 
	.state('admin.prototype.cemain', {
		url: '/compliance-and-enforcement',
		templateUrl: 'modules/prototype/client/views/ce-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, inspection) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;
			$scope.inspection = inspection;
			$scope.inspectionActions = _.filter(project.actions, function(a) { return a.inspectionId === inspection.inspectionId; });
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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

			$scope.conditions = _.filter(conditions, function(x) { return x.projectId === project.projectId; });


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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project, topic, subtopic) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
			$scope.topic = topic;
			$scope.subtopic = subtopic;

			// find all conditions, etc related to subtopic
		}
	});


}]);