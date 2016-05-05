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
		abstract: true,
		template: '<ui-view></ui-view>',
		onEnter: function (MenuControl, project) {
			MenuControl.routeAccess (project.code, 'any','edit-roles');
		}
	})
	.state('p.roles.list', {
		url: '/list',
		templateUrl: 'modules/roles/client/views/project-role-list.html',
		resolve: {
			projectRoles: function ($stateParams, RoleModel, project) {
				return RoleModel.getProjectRoles (project._id);
			}
		},
		controller: function ($scope, NgTableParams, projectRoles) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: projectRoles});
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
				return RoleModel.getAllSystemRoles ();
			}
		},
		controller: function ($scope, NgTableParams, systemRoles) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: systemRoles});
		}
	})
		.state('p.roles.create', {
			//data: {roles: ['admin','edit-sys-roles']},
			url: '/create',
			templateUrl: 'modules/roles/client/views/project-role-edit.html',
			resolve: {
				role: function (RoleModel) {
					return RoleModel.getNew ();
				}
			},
			controller: function ($scope, $state, project, role, RoleModel, $filter) {
				$scope.role = role;

				$scope.isEdit = false;
				$scope.role.isSystem = false;
				$scope.role.isProjectDefault = false;
				$scope.role.isFunctional = true;
				$scope.role.name = undefined;
				$scope.role.code = undefined;
				$scope.role.name = undefined;
				$scope.role.orgCode = project.orgCode;
				$scope.role.projectCode = project.code;
				
				$scope.calculateCode = function() {
					$scope.role.code = [$scope.role.projectCode,$scope.role.orgCode,$scope.role.roleCode ].join(':');
				};

				$scope.save = function (isValid) {
					if (!isValid) {
						$scope.$broadcast('show-errors-check-validity', 'roleForm');
						return false;
					}

					$scope.role.projects.push(project._id.toString());

					RoleModel.createProjectRole ($scope.role)
						.then (function (model) {
					 		return $state.go('p.roles.list');
						})
						.catch (function (err) {
							console.error (err);
							//alert (err);
						});

				};
				$scope.calculateCode();
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the edit state
		//
		// -------------------------------------------------------------------------
		.state('p.roles.edit', {
			//data: {roles: ['admin','edit-sys-roles']},
			url: '/:roleCode/edit',
			templateUrl: 'modules/roles/client/views/project-role-edit.html',
			resolve: {
				role: function ($stateParams, RoleModel) {
					return RoleModel.getModel ($stateParams.roleCode);
				},
				roleUsers: function($stateParams, RoleModel) {
					return RoleModel.getUsersForRole ($stateParams.roleCode);
				}
			},
			controller: function ($scope, $state, NgTableParams, project, role, roleUsers, RoleModel) {
				$scope.role = role;
				$scope.users = roleUsers.users;
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: roleUsers.users});

				$scope.isEdit = true;

				$scope.calculateCode = function() {
					$scope.role.code = [$scope.role.projectCode,$scope.role.orgCode,$scope.role.roleCode ].join(':');
				};

				$scope.assignUsersToRole = function(users, parent) {
					$scope.tableParams.data = users;
					$scope.tableParams.reload();
				};

				$scope.save = function (isValid) {
					if (!isValid) {
						$scope.$broadcast('show-errors-check-validity', 'roleForm');
						return false;
					}

					// add the users table data to the role
					// save the role
					$scope.role.users = $scope.tableParams.data;
					RoleModel.saveProjectRole ($scope.role)
						.then (function (model) {
							$state.go('p.roles.list');
						})
						.catch (function (err) {
							console.error (err);
							//alert (err);
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
		.state('p.roles.detail', {
			url: '/:roleCode',
			templateUrl: 'modules/roles/client/views/project-role-view.html',
			resolve: {
				role: function ($stateParams, RoleModel) {
					return RoleModel.getModel ($stateParams.roleCode);
				},
				roleUsers: function($stateParams, RoleModel) {
					return RoleModel.getUsersForRole ($stateParams.roleCode);
				}
			},
			controller: function ($scope, NgTableParams, role, roleUsers) {
				$scope.role = role;
				$scope.users = roleUsers.users;
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: roleUsers.users});
			}
		})	// -------------------------------------------------------------------------
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

			$scope.isEdit = false;
			$scope.role.isSystem = true;
			$scope.role.code = undefined;
			$scope.role.name = undefined;
			$scope.role.orgCode = undefined;
			
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'roleForm');
					return false;
				}

				RoleModel.addSystemRole ($scope.role).then (function (model) {
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
			$scope.isEdit = true;
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'roleForm');
					return false;
				}
				
				RoleModel.saveSystemRole ($scope.role)
					.then (function (model) {
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
