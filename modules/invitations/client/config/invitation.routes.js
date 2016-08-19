'use strict';

angular.module('core').config(['$stateProvider', 'RELEASE', function ($stateProvider, RELEASE) {
	if (RELEASE.enableInvitations) {
		$stateProvider
			.state('p.invitation', {
				abstract: true,
				url: '/invitation',
				template: '<ui-view></ui-view>',
				resolve: {}
			})
			.state('p.invitation.list', {
				url: '/list',
				templateUrl: 'modules/invitations/client/views/invitation-list.html',
				resolve: {
					communications: function ($stateParams, CommunicationModel, project) {
						return CommunicationModel.forProject(project._id);
					}
				},
				controller: function ($scope, $modal, $state, Authentication, NgTableParams, _, project, communications) {
					// let's just filter it out here...
					var invitationCommunications = _.filter(communications, function (o) {
						return o.type === 'Invitation';
					});
					$scope.tableParams = new NgTableParams({count: 10}, {dataset: invitationCommunications});
					$scope.project = project;
					$scope.authentication = Authentication;
					var self = this;
				},
				controllerAs: 'self'
			})
			.state('p.invitation.create', {
				url: '/create',
				templateUrl: 'modules/invitations/client/views/invitation-edit.html',
				resolve: {
					communication: function (CommunicationModel) {
						return CommunicationModel.new();
					},
					mode: function () {
						return 'create';
					}
				},
				controller: 'EditInvitationController',
				controllerAs: 's'
			})
			.state('p.invitation.edit', {
				url: '/:communicationId/edit',
				templateUrl: 'modules/invitations/client/views/invitation-edit.html',
				resolve: {
					communication: function ($stateParams, CommunicationModel) {
						return CommunicationModel.getModel($stateParams.communicationId);
					},
					mode: function () {
						return 'edit';
					}
				},
				controller: 'EditInvitationController',
				controllerAs: 's'
			})
			.state('p.invitation.detail', {
				url: '/:communicationId',
				templateUrl: 'modules/invitations/client/views/invitation-view.html',
				resolve: {
					communication: function ($stateParams, CommunicationModel) {
						return CommunicationModel.getModel($stateParams.communicationId);
					},
					mode: function () {
						return 'detail';
					}
				},
				controller: 'EditInvitationController',
				controllerAs: 's'
			});
	}
}]);
