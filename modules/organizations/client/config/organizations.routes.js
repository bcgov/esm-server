'use strict';

// Setting up route
angular.module('organizations').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('list', {
                url: '/organizations/list',
                templateUrl: 'modules/organizations/client/views/list-organizations.client.view.html',
                controller: 'OrganizationsListController',
            });
    }
]);
