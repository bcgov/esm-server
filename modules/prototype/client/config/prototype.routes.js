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
			project: function(PrototypeModel) {
				return PrototypeModel.getProject();
			}
		}
	})

	// PROJECT MAIN 
	.state('admin.prototype.projectmain', {
		url: '/project-main',
		templateUrl: 'modules/prototype/client/views/project-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.project = project;

		},
	})

	// COMPLIANCE & ENFORCEMENT MAIN 
	.state('admin.prototype.cemain', {
		url: '/compliance-and-enforcement',
		templateUrl: 'modules/prototype/client/views/ce-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
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
				var result = _.find(project.inspections, function(i) { return i._id === $stateParams.inspectionId; });
				return result;
			}
		},
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project, inspection) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.project = project;
			$scope.inspection = inspection;
			$scope.inspectionActions = _.filter(project.actions, function(a) { return a.inspectionId === inspection._id; });
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

		},
	})


}]);