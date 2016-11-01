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
			$scope.clearPrimaryContact = function() {
				$scope.org.primaryContact = null;
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
            },
			projects: function(org, ProjectModel) {
				return ProjectModel.forOrg(org._id);
			}
        },
        controller: function ($scope, $state, NgTableParams, org, users, projects, OrganizationModel, $filter, $modal, _, UserModel) {
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
			$scope.clearPrimaryContact = function() {
				$scope.org.primaryContact = null;
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
            },
			projects: function(org, ProjectModel) {
				return ProjectModel.forOrg(org._id);
			}
        },
        controller: function ($scope, NgTableParams, org, users, projects, UserModel, OrganizationModel, ProjectModel) {
            $scope.org = org;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
			$scope.projectTableParams = new NgTableParams ({count:10}, {dataset: projects});

			$scope.removeProjectFromOrg = function (code) {
				//console.log("Removing ", code, " from org ", $scope.org);
				ProjectModel.byCode(code)
					.then( function (p) {
						p.proponent = null;
						return ProjectModel.save(p);
					})
					.then( function () {
						return ProjectModel.forOrg($scope.org._id);
					})
					.then ( function (projs) {
						$scope.projectTableParams = new NgTableParams ({count:10}, {dataset: projs});
						$scope.$apply();
					});
			};
            $scope.removeUserFromOrg = function (userId) {
                //console.log("Removing ", userId, " from org ", $scope.org);
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
        templateUrl: 'modules/organizations/client/views/organization-user-edit.html',
        resolve: {
            user: function (UserModel) {
                return UserModel.getNew ();
            },
            orgs: function(OrganizationModel) {
                return OrganizationModel.getCollection();
            }
        },
        controller: function ($scope, $state, org, user, orgs, UserModel, $filter, SALUTATIONS) {
            $scope.user = user;
            $scope.user.org = org;
            $scope.org = org;
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
                        $state.transitionTo('admin.organization.detail', {orgId: org._id}, {
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
    .state('admin.organization.user.edit', {
        data: {permissions: ['createOrganization']},
        url: '/:userId/edit',
        templateUrl: 'modules/organizations/client/views/organization-user-edit.html',
        resolve: {
            user: function ($stateParams, UserModel) {
                return UserModel.getModel ($stateParams.userId);
            },
            orgs: function(OrganizationModel) {
                return OrganizationModel.getCollection();
            }
        },
        controller: function ($scope, $state, org, orgs, user, UserModel, $filter, PROVINCES, SALUTATIONS) {
            $scope.user = user;
            $scope.roles = [];
            $scope.org = org;
            //$scope.user.org = org._id;
            //$scope.user.orgName = org.name;
            $scope.orgs = orgs;
            $scope.provs = PROVINCES;
            $scope.salutations = SALUTATIONS;
            var which = 'edit';

            $scope.calculateName = function() {
                $scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ');
            };

            $scope.save = function (isValid) {
                if (!$scope.user.username || $scope.user.username === '') {
                    $scope.user.username = $filter('kebab')( $scope.user.displayName );
                }
                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'userForm');
                    return false;
                }
                $scope.user.code = $filter('kebab')($scope.user.name);
                var p = (which === 'add') ? UserModel.add ($scope.user) : UserModel.save ($scope.user);
                p.then (function (model) {
                    $state.transitionTo('admin.organization.detail', {orgId: org._id}, {
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
    // this is the 'view' state
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.user.detail', {
        data: {permissions: ['createOrganization']},
        url: '/:userId',
        templateUrl: 'modules/organizations/client/views/organization-user-view.html',
        resolve: {
            user: function ($stateParams, UserModel) {
                return UserModel.getModel ($stateParams.userId);
            }
        },
        controller: function ($scope, org, user) {
            $scope.user = user;
            $scope.org = org;
        }
    })





    ;

}]);



// 'use strict';

// // Setting up route
// angular.module('organizations').config(['$stateProvider',
//     function ($stateProvider) {
//         $stateProvider
//             .state('organization', {
//                 abstract: true,
//                 url: '/organization',
//                 template: '<div ui-view></div>',
//                 data: {
//                     roles: ['user', 'admin']
//                 }
//             })
//             .state('organization.list', {
//                 url: '/list',
//                 templateUrl: 'modules/organizations/client/views/list-organizations.client.view.html',
//                 controller: 'OrganizationsListController',
//                 controllerAs: 'listOrganizations'
//             })
//             .state('organization.new', {
//                 url: '/new',
//                 templateUrl: 'modules/organizations/client/views/new-organization.client.view.html',
//                 controller: 'NewOrganizationController',
//                 controllerAs: 'addOrganization'
//             })
//             .state('organization.edit', {
//                 url: '/edit/:organizationId',
//                 templateUrl: 'modules/organizations/client/views/edit-organization.client.view.html',
//                 controller: 'editOrganizationController',
//                 controllerAs: 'editOrganization'
//             })
//             .state('organization.view', {
//                 url: '/view/:organizationId',
//                 templateUrl: 'modules/organizations/client/views/view-organization.client.view.html',
//                 controller: 'viewOrganizationController',
//                 controllerAs: 'viewOrganization'
//             });
//     }
// ]);
