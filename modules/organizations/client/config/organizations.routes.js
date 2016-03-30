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
                    $state.transitionTo('admin.org.list', {}, {
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
            }
        },
        controller: function ($scope, $state, org, OrganizationModel, $filter) {
            $scope.org = org;
            var which = 'edit';
            $scope.save = function (isValid) {
                if (!isValid) {
                    $scope.$broadcast('show-errors-check-validity', 'organizationForm');
                    return false;
                }
                $scope.org.code = $filter('kebab')($scope.org.name);
                var p = (which === 'add') ? OrganizationModel.add ($scope.org) : OrganizationModel.save ($scope.org);
                p.then (function (model) {
                    $state.transitionTo('admin.org.list', {}, {
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
            }
        },
        controller: function ($scope, org) {
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
