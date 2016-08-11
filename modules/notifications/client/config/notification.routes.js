'use strict';
// =========================================================================
//
// vc routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.notification', {
			abstract:true,
			url: '/notification',
			template: '<ui-view></ui-view>',
			resolve: {}
		})
		.state('p.notification.list', {
			url: '/list',
			templateUrl: 'modules/notifications/client/views/notification-list.html',
			resolve: {
				notifications: function ($stateParams, NotificationModel, project) {
					return NotificationModel.forProject (project._id);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, NgTableParams, project, notifications) {
			}
		})
		.state('p.notification.create', {
			url: '/create',
			templateUrl: 'modules/notifications/client/views/notification-edit.html',
			resolve: {
			},
			controller: function ($scope, $state) {
			}
		})
		.state('p.notification.edit', {
			url: '/:notificationId/edit',
			templateUrl: 'modules/notifications/client/views/notification-edit.html',
			resolve: {
				notification: function ($stateParams, NotificationModel) {
					return NotificationModel.getModel ($stateParams.notificationId);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, project, notification) {
			}
		})
		.state('p.notification.detail', {
			url: '/:notificationId',
			templateUrl: 'modules/notifications/client/views/notification-view.html',
			resolve: {
				notification: function ($stateParams, NotificationModel) {
					return NotificationModel.getModel ($stateParams.notificationId);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, project, notification) {
			}
		});
}]);
