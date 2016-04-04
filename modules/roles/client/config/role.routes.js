'use strict';
// =========================================================================
//
// roles routes
//
// =========================================================================
angular.module('roles').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for project roles.
	//
	// -------------------------------------------------------------------------
	.state('p.roles', {
		url: '/roles',
		templateUrl: 'modules/roles/client/views/role.html',
		resolve: {
			roles: function (RoleModel, project) {
				return RoleModel.getUsersInRolesInProject (project._id);
			}
		},
		controller: function($scope, roles, project, _, RoleModel) {
			$scope.roles = roles;
			$scope.project = project;
			// callback when assigning users to roles
			$scope.assignUsersToRole = function(users, parent) {
				console.log(users, parent);
				var userIds = _.map(users, function(user) {
					return user._id;
				});
				if (userIds) {
					RoleModel.setRoleUsers(parent.reference, userIds).then( function(data) {
						RoleModel.getUsersForRole(parent.reference).then( function(data) {
							$scope.roles[parent.reference] = data;
						});
					});
				}
			};
		},
		onEnter: function (MenuControl, project) {
			MenuControl.routeAccess (project.code, 'any','edit-roles');
		}
	})

	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for system roles.
	// we resolve system roles to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.roles', {
		data: {roles: ['admin','eao']},
		abstract:true,
		url: '/roles',
		template: '<ui-view></ui-view>'
	})
	// -------------------------------------------------------------------------
	//
	// the list state for system roles. system roles are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.roles.list', {
		url: '/list',
		templateUrl: 'modules/roles/client/views/role-list.html',
		resolve: {
			systemRoles: function ($stateParams, RoleModel) {
				return RoleModel.getSystemRoles ();
			}
		},
		controller: function ($scope, NgTableParams, systemRoles) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: systemRoles});
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('admin.roles.create', {
		data: {roles: ['admin','edit-sys-roles']},
		url: '/create',
		templateUrl: 'modules/roles/client/views/role-edit.html',
		resolve: {
			role: function (RoleModel) {
				return RoleModel.getNew ();
			}
		},
		controller: function ($scope, $state, role, RoleModel, $filter) {
			$scope.role = role;
			var which = 'add';
			$scope.save = function (isValid) {
				$scope.role.code = $scope.role.roleCode;
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'roleForm');
					return false;
				}

				var p = (which === 'add') ? RoleModel.add ($scope.roles) : RoleModel.save ($scope.role);
				p.then (function (model) {
					$state.transitionTo('admin.roles.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.roles.edit', {
		data: {roles: ['admin','edit-sys-roles']},
		url: '/:roleCode/edit',
		templateUrl: 'modules/roles/client/views/role-edit.html',
		resolve: {
			role: function ($stateParams, RoleModel) {
				return RoleModel.getModel ($stateParams.roleCode);
			}
		},
		controller: function ($scope, $state, role, RoleModel, $filter) {
			$scope.role = role;
			var which = 'edit';
			$scope.save = function (isValid) {
				$scope.role.code = $scope.role.roleCode;
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'roleForm');
					return false;
				}
				
				var p = (which === 'add') ? RoleModel.add ($scope.role) : RoleModel.save ($scope.role);
				p.then (function (model) {
					$state.transitionTo('admin.roles.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a roles. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('admin.roles.detail', {
		url: '/:roleCode',
		templateUrl: 'modules/roles/client/views/role-view.html',
		resolve: {
			role: function ($stateParams, RoleModel) {
				return RoleModel.getModel ($stateParams.roleCode);
			}
		},
		controller: function ($scope, role) {
			$scope.role = role;
		}
	})

	;

}]);
