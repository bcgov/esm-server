'use strict';

// Setting up route
angular.module('organizations').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('organization', {
                abstract: true,
                url: '/organization',
                template: '<div ui-view></div>',
                data: {
                    roles: ['user', 'admin']
                }
            })        
            .state('organization.list', {
                url: '/list',
                templateUrl: 'modules/organizations/client/views/list-organizations.client.view.html',
                controller: 'OrganizationsListController',
                controllerAs: 'listOrganizations'
            })
            .state('organization.new', {
                url: '/new',
                templateUrl: 'modules/organizations/client/views/new-organization.client.view.html',
                controller: 'NewOrganizationController',
                controllerAs: 'addOrganization'
            })
            .state('organization.edit', {
                url: '/edit/:organizationId',
                templateUrl: 'modules/organizations/client/views/edit-organization.client.view.html',
                controller: 'editOrganizationController',
                controllerAs: 'editOrganization'
            })
            .state('organization.view', {
                url: '/view/:organizationId',
                templateUrl: 'modules/organizations/client/views/view-organization.client.view.html',
                controller: 'viewOrganizationController',
                controllerAs: 'viewOrganization'
            });
    }
]);
