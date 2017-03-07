'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider', '_', function ($stateProvider, _) {
	$stateProvider
	.state('admin.user', {
		data: {permissions: ['listContacts']},
		abstract:true,
		url: '/user',
		template: '<ui-view></ui-view>'
	})
	// -------------------------------------------------------------------------
	//
	// the list state for users. users are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.user.list', {
		url: '/list',
		templateUrl: 'modules/users/client/views/admin/user-list.html',
		resolve: {
			users: function(UserModel) {
				return UserModel.getSorted('lastName firstName');
			}
		},
		controller: function ($scope, _, NgTableParams, users) {
			$scope.$data = users;
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
		.state('admin.user.create', {
			data: {permissions: ['createContact']},
			url: '/create',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function (UserModel) {
					return UserModel.getNew ();
				},
				orgs: function(OrganizationModel) {
					return OrganizationModel.getSorted('name');
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user) {
				$scope.user = user;
				$scope.groupsAndRoles = {};
				$scope.mode = 'add';
				$scope.readonly = false;
				$scope.enableDelete = false;
				$scope.enableSave = true;
				$scope.enableEdit = false;
				$scope.enableSetOrganization = true;
				$scope.enableSignature = false;
				$scope.enableNotes = true;
				$scope.showDisplayName = false;
				$scope.showUsername = false;
				$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'Add Contact';
				userEditControl.cancel = function() {
					$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
				};

				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
				};
			}
		})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
		.state('admin.user.edit', {
			data: {permissions: ['createContact']},
			url: '/:userId/edit',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function ($stateParams, UserModel) {
					return UserModel.getModel ($stateParams.userId);
				},
				groupsAndRoles: function($stateParams, UserModel) {
					return UserModel.groupsAndRoles ($stateParams.userId);
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, groupsAndRoles) {
				$scope.user = user;
				$scope.groupsAndRoles = groupsAndRoles;
				$scope.mode = 'edit';
				$scope.readonly = false;
				$scope.enableDelete = true;
				$scope.enableSave = true;
				$scope.enableEdit = false;
				$scope.enableSetOrganization = true;
				$scope.enableSignature = true;
				$scope.enableNotes = true;
				$scope.showDisplayName = true;
				$scope.showUsername = true;
				$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'Edit Contact';
				userEditControl.cancel = function() {
					$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
				};

				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
				};
			}
		})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a users. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
		.state('admin.user.detail', {
			url: '/:userId',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function ($stateParams, UserModel) {
					return UserModel.getModel ($stateParams.userId);
				},
				groupsAndRoles: function($stateParams, UserModel) {
					return UserModel.groupsAndRoles ($stateParams.userId);
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, groupsAndRoles) {
				$scope.user = user;
				$scope.groupsAndRoles = groupsAndRoles;
				$scope.mode = 'view';
				$scope.readonly = true;
				$scope.enableDelete = false;
				$scope.enableSave = false;
				$scope.enableEdit = true;
				$scope.enableSetOrganization = false;
				$scope.enableSignature = true;
				$scope.enableNotes = true;
				$scope.showDisplayName = true;
				$scope.showUsername = true;
				$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'View Contact';

				userEditControl.cancel = function() {
					$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.edit = function() {
					$state.transitionTo('admin.user.edit', {userId : $scope.user._id}, {reload: true, inherit: false, notify: true});
				};

				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
				};
			}
		})

	;

}]);
