'use strict';
// =========================================================================
//
// vc routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.communication', {
			abstract:true,
			url: '/communication',
			template: '<ui-view></ui-view>',
			resolve: {}
		})
		.state('p.communication.list', {
			url: '/list',
			templateUrl: 'modules/communications/client/views/communication-list.html',
			resolve: {
				communications: function ($stateParams, CommunicationModel, project) {
					return CommunicationModel.forProject (project._id);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, NgTableParams, project, communications) {
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: communications});
				$scope.project = project;
				$scope.authentication = Authentication;
				var self = this;

			},
			controllerAs: 'self'
		})
		.state('p.communication.create', {
			url: '/create',
			templateUrl: 'modules/communications/client/views/communication-edit.html',
			resolve: {
				communication: function(CommunicationModel) {
					return CommunicationModel.new();
				}
			},
			controller: function ($scope, $state, $modal, Authentication, project, communication) {
				$scope.project = project;
				$scope.authentication = Authentication;
				var self = this;
				self.communication = communication;



			},
			controllerAs: 's'
		})
		.state('p.communication.edit', {
			url: '/:communicationId/edit',
			templateUrl: 'modules/communications/client/views/communication-edit.html',
			resolve: {
				communication: function ($stateParams, CommunicationModel) {
					return CommunicationModel.getModel ($stateParams.communicationId);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, project, communication) {
			}
		})
		.state('p.communication.detail', {
			url: '/:communicationId',
			templateUrl: 'modules/communications/client/views/communication-view.html',
			resolve: {
				communication: function ($stateParams, CommunicationModel) {
					return CommunicationModel.getModel ($stateParams.communicationId);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, project, communication) {
			}
		});
}]);
