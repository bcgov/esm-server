'use strict';
// =========================================================================
//
// prototype routes (under admin)
//
// =========================================================================
angular.module('prototype').config(['$stateProvider', function ($stateProvider) {
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
				return PrototypeModel.getProjectDetail();
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for prototype. orgs are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.prototype.list', {
		url: '/list',
		templateUrl: 'modules/prototype/client/views/prototype-list.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.data = PrototypeModel.getData();
			console.log("data:", $scope.data);
		},
	})

	// PROJECT MAIN 
	.state('admin.prototype.projectmain', {
		url: '/project-main',
		templateUrl: 'modules/prototype/client/views/project-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel, project) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			// Project Detail (Main)
			$scope.projectDetail = PrototypeModel.getProjectDetail();

			// Project Inspections
			$scope.projectinspections = PrototypeModel.getProjectInspections();

			// TODO: Need a count all actions across all inspections per project
			$scope.projectActionCount = 0;
		},
	})

	// COMPLIANCE & ENFORCEMENT MAIN 
	.state('admin.prototype.cemain', {
		url: '/compliance-and-enforcement',
		templateUrl: 'modules/prototype/client/views/ce-main.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			// Project Details
			$scope.projectDetail = PrototypeModel.getProjectDetail();
			console.log("data:", $scope.getProjectCeDetails);
			
			// Compliance & Enforcement Details
			$scope.projectcedetails = PrototypeModel.getProjectCeDetails();

			// inspections 
			$scope.projectinspections = PrototypeModel.getProjectInspections();
			console.log("data:", $scope.getProjectInspections);
		},
	})

	// INSPECTION PAGE
	.state('admin.prototype.inspection', {
		url: '/inspection',
		templateUrl: 'modules/prototype/client/views/ce-inspection.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel) {
			$scope.authentication = Authentication;
			$scope.application = Application;

			$scope.projectDetail = PrototypeModel.getProjectDetail();
			console.log("data:", $scope.getProjectCeDetails);

			$scope.projectinspections = PrototypeModel.getProjectInspections();
			console.log("data:", $scope.projectinspections);

			$scope.projectactions = PrototypeModel.getProjectActions();
			console.log("data:", $scope.projectactions);
		},
	})

	// ACTION 
	.state('admin.prototype.action', {
		url: '/action',
		templateUrl: 'modules/prototype/client/views/ce-action.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			console.log("data:", $scope.data);

			$scope.projectDetail = PrototypeModel.getProjectDetail();
			console.log("data:", $scope.getProjectCeDetails);

			$scope.projectinspections = PrototypeModel.getProjectInspections();
			console.log("data:", $scope.projectinspections);

			$scope.projectactions = PrototypeModel.getProjectActions();
			console.log("data:", $scope.projectactions);
		},
	})

	// TOPIC
	.state('admin.prototype.topic', {
		url: '/topic',
		templateUrl: 'modules/prototype/client/views/topic.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			console.log("data:", $scope.data);
		},
	})

	// SUBTOPIC
	.state('admin.prototype.subtopic', {
		url: '/subtopic',
		templateUrl: 'modules/prototype/client/views/subtopic.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			console.log("data:", $scope.data);
		},
	})

	;


}]);