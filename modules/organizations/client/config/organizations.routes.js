'use strict';

// Setting up route
angular.module('organizations').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('list', {
                url: '/organizations/list',
                templateUrl: 'modules/organizations/client/views/list-organizations.client.view.html',
                controller: 'OrganizationsListController',
                controllerAs: 'listOrganizations'
            })
            .state('new', {
                url: '/organization/new',
                templateUrl: 'modules/organizations/client/views/new-organization.client.view.html',
                controller: 'NewOrganizationController',
                controllerAs: 'addOrganization'
            })
            .state('edit', {
                url: '/organization/:organizationId/edit',
                templateUrl: 'modules/organizations/client/views/edit-organization.client.view.html',
                controller: 'editOrganizationController',
                controllerAs: 'editOrganization'
            })
            .state('view', {
                url: '/organization/:organizationId/view',
                templateUrl: 'modules/organizations/client/views/view-organization.client.view.html',
                controller: 'viewOrganizationController',
                controllerAs: 'viewOrganization'
            });
    }
]);
