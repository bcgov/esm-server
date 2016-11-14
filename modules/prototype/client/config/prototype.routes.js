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
			inspectionsText: function(data) {
				return data.inspectionsText;
			},
			inspections: function(data, inspectionsText) {
				var inspections = data.inspections;
				_.each(inspectionsText, function(txt) {
					var inspection = _.find(inspections, function(x) { return txt.agency === x.agency && txt.project === x.project && txt.inspectionId === x.inspectionId; });
					if (inspection) {
						inspection.followupText = txt.followupText;
					}
				});
				return inspections;
			},
			actionsText: function(data) {
				return data.actionsText;
			},
			actions: function(data, actionsText) {
				var actions = data.actions;
				_.each(actionsText, function(txt) {
					var action = _.find(actions, function(x) { return txt.agency === x.agency && txt.project === x.project && txt.orderId === x.orderId; });
					if (action) {
						action.text = txt.text;
						action.responseText = txt.responseText;
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
					var condition = _.find(conditions, function(x) { return txt.agency === x.agency && txt.project === x.project && txt.permitId === x.permitId && txt.conditionNo === x.conditionNo; });
					if (condition) {
						condition.conditionText = txt.conditionText;
					}
				});
				return conditions;
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
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, agencies, topics, subTopics, projects, cedetails, authorizations, phases, inspections, actions, conditions, documents, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;
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
				var result = _.find(project.actions, function(i) { return i._id === $stateParams.orderId; });
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