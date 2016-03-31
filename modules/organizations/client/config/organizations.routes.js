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
        controller: function ($scope, NgTableParams, orgs) {
            $scope.orgs = orgs;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: orgs});
        }
    })
    // -------------------------------------------------------------------------
    //
    // this is the add, or create state. it is defined before the others so that
    // it does not conflict
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.create', {
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
    .state('admin.organization.edit', {
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
        controller: function ($scope, $state, NgTableParams, org, users, OrganizationModel, $filter) {
            $scope.org = org;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
            var which = 'edit';
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
                    alert (err);
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
        controller: function ($scope, NgTableParams, org, users) {
            $scope.org = org;
            $scope.tableParams = new NgTableParams ({count:10}, {dataset: users});
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
        abstract:true,
        url: '/:orgId/user',
        template: '<ui-view></ui-view>',
        resolve: {
            org: function ($stateParams, OrganizationModel) {
                return OrganizationModel.getModel ($stateParams.orgId);
            }
        },
    })
    // -------------------------------------------------------------------------
    //
    // user create state
    //
    // -------------------------------------------------------------------------
    .state('admin.organization.user.create', {
        url: '/create',
        templateUrl: 'modules/organizations/client/views/organization-user-edit.html',
        resolve: {
            user: function (UserModel) {
                return UserModel.getNew ();
            }
        },
        controller: function ($scope, $state, org, orgs, user, UserModel, $filter, PROVINCES, SALUTATIONS) {
            $scope.user = user;
            $scope.org = org;
            $scope.user.org = org._id;
            $scope.user.orgName = org.name;
            $scope.orgs = orgs;
            $scope.provs = PROVINCES;
            $scope.salutations = SALUTATIONS;

            $scope.calculateName = function() {
                $scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ');
            };

            var which = 'add';
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
    .state('admin.organization.user.edit', {
        url: '/:userId/edit',
        templateUrl: 'modules/organizations/client/views/organization-user-edit.html',
        resolve: {
            user: function ($stateParams, UserModel) {
                return UserModel.getModel ($stateParams.userId);
            }
        },
        controller: function ($scope, $state, org, user, UserModel, $filter, PROVINCES) {
            $scope.user = user;
            $scope.org = org;
            $scope.provs = PROVINCES;
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
                    alert (err);
                });
            };
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
