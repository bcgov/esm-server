'use strict';
// =========================================================================
//
// org routes (under admin)
//
// =========================================================================
angular.module('organizations').config(['$stateProvider', function ($stateProvider) {
    $stateProvider
    // -------------------------------------------------------------------------
    //
    // this is the abstract, top level view for orgs.
    // we resolve orgs to all sub-states
    //
    // -------------------------------------------------------------------------
    .state('admin.organization', {
        data: {permissions: ['listOrganizations']},
        abstract:true,
        url: '/organization',
        template: '<ui-view></ui-view>',
        resolve: {
            orgs: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getCollection ();
            }
        }
    })
    // -------------------------------------------------------------------------
    //
    // the list state for orgs. orgs are guaranteed to
    // already be resolved
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.list', {
        url: '/list',
        templateUrl: 'modules/organizations/client/views/organization-list.html',
        controller: function ($scope, NgTableParams, Application, Authentication, orgs) {
            $scope.authentication = Authentication;
            $scope.application = Application;
            $scope.orgs = orgs;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: orgs});
        },
    })
    // -------------------------------------------------------------------------
    //
    // this is the add, or create state. it is defined before the others so that
    // it does not conflict
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.create', {
        data: {permissions: ['createOrganization']},
        url: '/create',
        templateUrl: 'modules/organizations/client/views/organization-edit.html',
        resolve: {
            org: function (OrganizationModel) {
                return OrganizationModel.getNew ();
            }
        },
        controller: function ($scope, $state, org, OrganizationModel, $filter) {
            $scope.org = org;
            var which = 'add';
            $scope.save = function (isValid) {
                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'organizationForm');
                    return false;
                }
                $scope.org.code = $filter('kebab')($scope.org.name);
                var p = (which === 'add') ? OrganizationModel.add ($scope.org) : OrganizationModel.save ($scope.org);
                p.then (function (model) {
                    $state.transitionTo('admin.organization.list', {}, {
                        reload: true, inherit: false, notify: true
                    });
                })
                .catch (function (err) {
                    console.error (err);
                    // alert (err.message);
                });
            };
        },
    })
    // -------------------------------------------------------------------------
    //
    // this is the edit state
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.edit', {
        data: {permissions: ['createOrganization']},
        url: '/:orgId/edit',
        templateUrl: 'modules/organizations/client/views/organization-edit.html',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            },
            users: function (org, OrganizationModel) {
                return OrganizationModel.getUsers (org._id);
            }
        },
        controller: function ($scope, $state, NgTableParams, org, users, OrganizationModel, $filter, $modal, _, UserModel) {
            $scope.org = org;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
            var which = 'edit';

			$scope.showSuccess = function(msg, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-success.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.title = title || 'Success';
						self.msg = msg;
						self.ok = function() {
							$modalInstance.close($scope.org);
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
							$modalInstance.close($scope.org);
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
				$state.transitionTo('admin.organization.list', {}, {
					reload: true, inherit: false, notify: true
				});
			};

			var reloadEdit = function() {
				// want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
				$scope.allowTransition = true;
				$state.reload();
			};

			$scope.deleteOrg = function () {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.dialogTitle = "Delete Organization";
						self.name = $scope.org.name;
						self.ok = function() {
							$modalInstance.close($scope.org);
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
					OrganizationModel.deleteId($scope.org._id)
					.then(function (res) {
						_.each(users, function (u) {
							// These users no longer belong to an org
							u.org = null;
							u.orgName = "";
							UserModel.save(u)
							.then( function (a) {
								console.log("changed:", a);
							});
						});
						// deleted show the message, and go to list...
						$scope.showSuccess('"'+ $scope.org.name +'"' + ' was deleted successfully.', goToList, 'Delete Success');
					})
					.catch(function (res) {
						console.log("res:", res);
						// could have errors from a delete check...
						var failure = _.has(res, 'message') ? res.message : undefined;
						$scope.showError('"'+ $scope.org.name +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
					});
				}, function () {
					//console.log('delete modalDocView error');
				});
			};

            $scope.save = function (isValid) {
                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'organizationForm');
                    return false;
                }
                $scope.org.code = $filter('kebab')($scope.org.name);
                var p = (which === 'add') ? OrganizationModel.add ($scope.org) : OrganizationModel.save ($scope.org);
                p.then (function (model) {
                    $state.transitionTo('admin.organization.list', {}, {
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
    // this is the 'view' mode of a org. here we are just simply
    // looking at the information for this specific object
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.detail', {
        url: '/:orgId',
        templateUrl: 'modules/organizations/client/views/organization-view.html',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            },
            users: function (org, OrganizationModel) {
                return OrganizationModel.getUsers (org._id);
            }
        },
        controller: function ($scope, NgTableParams, org, users, UserModel, OrganizationModel) {
            $scope.org = org;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
            $scope.removeUserFromOrg = function (userId) {
                console.log("Removing ", userId, " from org ", $scope.org);
                UserModel.lookup(userId)
                .then( function (user) {
                    user.org = null;
                    user.orgName = "";
                    return UserModel.save(user);
                })
                .then( function () {
                    return OrganizationModel.getUsers ($scope.org._id);
                })
                .then ( function (users) {
                    $scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
                    $scope.$apply();
                });
            };
        }
    })

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    //
    // -------------------------------------------------------------------------
    // USERS
    // -------------------------------------------------------------------------
    //
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    .state('admin.organization.user', {
        data: {permissions: ['createOrganization']},
        abstract:true,
        url: '/:orgId/user',
        template: '<ui-view></ui-view>',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            },
            //roles: function (RoleModel) {
            //    return RoleModel.getSystemRoles ({isProjectDefault:false});
            //}
        },
    })
	// -------------------------------------------------------------------------
	//
	// user create state
	//
	// -------------------------------------------------------------------------
		.state('admin.organization.user.create', {
			data: {permissions: ['createOrganization']},
			url: '/create',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function (UserModel) {
					return UserModel.getNew ();
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, org) {
				$scope.user = user;
				$scope.org = org;
				$scope.mode = 'add';
				$scope.readonly = false;
				$scope.enableDelete = false;
				$scope.enableSave = true;
				$scope.enableEdit = false;
				$scope.enableSignature = false;
				//$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'Add Contact';
				userEditControl.cancel = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.onSave = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
					onCancel: userEditControl.cancel,
					onSave: userEditControl.onSave
				};
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the edit state
		//
		// -------------------------------------------------------------------------
		.state('admin.organization.user.edit', {
			data: {permissions: ['createOrganization']},
			url: '/:userId/edit',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function ($stateParams, UserModel) {
					return UserModel.getModel ($stateParams.userId);
				},
				orgs: function(OrganizationModel) {
					return OrganizationModel.getCollection();
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, org) {
				$scope.user = user;
				$scope.mode = 'edit';
				$scope.readonly = false;
				$scope.enableDelete = true;
				$scope.enableSave = true;
				$scope.enableEdit = false;
				$scope.enableSignature = false;
				//$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'Edit Contact';
				userEditControl.cancel = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.onSave = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.onDelete = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
					onCancel: userEditControl.cancel,
					onSave: userEditControl.onSave,
					onDelete: userEditControl.onDelete
				};
			}
		})
		// -------------------------------------------------------------------------
		//
		// this is the 'view' state
		//
		// -------------------------------------------------------------------------
		.state('admin.organization.user.detail', {
			data: {permissions: ['createOrganization']},
			url: '/:userId',
			templateUrl: 'modules/users/client/views/user-edit.html',
			resolve: {
				user: function ($stateParams, UserModel) {
					return UserModel.getModel ($stateParams.userId);
				}
			},
			controllerAs: 'userEditControl',
			controller: function ($scope, $state, $filter, $modal, Authentication, user, org) {
				$scope.user = user;
				$scope.org = org;
				$scope.mode = 'edit';
				$scope.readonly = true;
				$scope.enableDelete = false;
				$scope.enableSave = false;
				$scope.enableEdit = true;
				$scope.enableSignature = false;
				//$scope.srefReturn = 'admin.user.list';

				var userEditControl = this;
				userEditControl.title = 'View Contact';

				userEditControl.cancel = function() {
					$state.transitionTo('admin.organization.detail', {orgId: org._id}, {reload: true, inherit: false, notify: true});
				};
				userEditControl.edit = function() {
					$state.transitionTo('admin.organization.user.edit', {orgId: org._id, userId: user._id}, {reload: true, inherit: false, notify: true});
				};

				// we pass this to the user entry directive/controller for communication between the two...
				$scope.userEntryControl = {
					onCancel: userEditControl.cancel
				};
			}
		})
	;
}]);
