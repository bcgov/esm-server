'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider', function ($stateProvider) {
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
		data: {permissions: ['createContact']},
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
		data: {permissions: ['createContact']},
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
		controller: function ($scope, $state, user, orgs, UserModel, $filter, SALUTATIONS, $modal, _) {
			$scope.user = user;
			$scope.orgs = orgs;
			$scope.mode = 'edit';
			$scope.salutations = SALUTATIONS;
			$scope.calculatedUsername = user.username;

			var which = $scope.mode;

			$scope.validate = function() {
				var phonregexp = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;
				if(phonregexp.test($scope.user.phoneNumber)) {
					// console.log("valid phone number");
					$scope.userForm.phoneNumber.$setValidity('required', true);
				} else {
					// console.log("invalid phone number");
					$scope.userForm.phoneNumber.$setValidity('required', false);
				}
			};

			$scope.calculateName = function() {
				$scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ');
			};

			$scope.showSuccess = function(msg, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-success.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.title = title || 'Success';
						self.msg = msg;
						self.ok = function() {
							$modalInstance.close($scope.user);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});
				// do not care how this modal is closed, just go to the desired location...
				modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
			};

			$scope.showError = function(msg, errorList, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-error.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.title = title || 'An error has occurred';
						self.msg = msg;
						self.ok = function() {
							$modalInstance.close($scope.user);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});
				// do not care how this modal is closed, just go to the desired location...
				modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
			};

			var goToList = function() {
				$state.transitionTo('admin.user.list', {}, {
					reload: true, inherit: false, notify: true
				});
			};

			var reloadEdit = function() {
				// want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
				$scope.allowTransition = true;
				$state.reload();
			};

			$scope.deleteUser = function () {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.dialogTitle = "Delete Contact";
						self.name = $scope.user.displayName;
						self.ok = function() {
							$modalInstance.close($scope.user);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md'
				});
				modalDocView.result.then(function (res) {
					UserModel.deleteId($scope.user._id)
					.then(function (res) {
						// deleted show the message, and go to list...
						$scope.showSuccess('"'+ $scope.user.displayName +'"' + ' was deleted successfully.', goToList, 'Delete Success');
					})
					.catch(function (res) {
						// could have errors from a delete check...
						var failure = _.has(res, 'message') ? res.message : undefined;
						$scope.showError('"'+ $scope.user.displayName +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
					});
				}, function () {
					//console.log('delete modalDocView error');
				});
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
