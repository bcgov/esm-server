'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	.state('admin.user', {
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
				return UserModel.getCollection();
			}
		},
		controller: function ($scope, NgTableParams, users) {
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
		url: '/create',
		templateUrl: 'modules/users/client/views/admin/user-edit.html',
		resolve: {
			user: function (UserModel) {
				return UserModel.getNew ();
			},
			orgs: function(OrganizationModel) {
				return OrganizationModel.getCollection();
			}
		},
		controller: function ($scope, $state, user, orgs, UserModel, $filter, SALUTATIONS) {
			$scope.user = user;
			$scope.orgs = orgs;
			$scope.salutations = SALUTATIONS;
			$scope.mode = 'add';

			var which = $scope.mode;
			$scope.calculateName = function() {
				$scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ');
				$scope.user.username = $filter('kebab')( $scope.user.displayName );
			};
			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'userForm');
					return false;
				}
				if ($scope.mode === 'add') {
					if (!$scope.user.username || $scope.user.username === '') {
						$scope.user.username = $filter('kebab')( $scope.user.displayName );
					}
				}
				var p = (which === 'add') ? UserModel.add ($scope.user) : UserModel.save ($scope.user);
				p.then (function (model) {
					$state.transitionTo('admin.user.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('admin.user.edit', {
		url: '/:userId/edit',
		templateUrl: 'modules/users/client/views/admin/user-edit.html',
		resolve: {
			user: function ($stateParams, UserModel) {
				return UserModel.getModel ($stateParams.userId);
			},
			orgs: function(OrganizationModel) {
				return OrganizationModel.getCollection();
			}
		},
		controller: function ($scope, $state, user, orgs, UserModel, $filter, SALUTATIONS) {
			$scope.user = user;
			$scope.orgs = orgs;
			$scope.mode = 'edit';
			$scope.salutations = SALUTATIONS;
			$scope.calculatedUsername = user.username;

			var which = $scope.mode;

			$scope.calculateName = function() {
				$scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ');
			};

			$scope.save = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'userForm');
					return false;
				}
				var p = (which === 'add') ? UserModel.add ($scope.user) : UserModel.save ($scope.user);
				p.then (function (model) {
					$state.transitionTo('admin.user.list', {}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					// alert (err.message);
				});
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
		templateUrl: 'modules/users/client/views/admin/user-view.html',
		resolve: {
			user: function ($stateParams, UserModel) {
				return UserModel.getModel ($stateParams.userId);
			}
		},
		controller: function ($scope, user) {
			$scope.user = user;
		}
	})

	;

}]);









// 		.state('admin.user', {
// 			url: '/users/:userId',
// 			templateUrl: 'modules/users/client/views/admin/users-view.html',
// 			controller: 'UserController',
// 			resolve: {
// 				userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
// 					return Admin.get({
// 						userId: $stateParams.userId
// 					});
// 				}]
// 			}
// 		})
// 		.state('admin.user-edit', {
// 			url: '/users/:userId/edit',
// 			templateUrl: 'modules/users/client/views/admin/users-edit.html',
// 			controller: 'UserController',
// 			resolve: {
// 				userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
// 					return Admin.get({
// 						userId: $stateParams.userId
// 					});
// 				}]
// 			}
// 		});
// 	}
// ]);
