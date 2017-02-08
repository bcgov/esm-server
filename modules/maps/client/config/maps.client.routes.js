'use strict';

angular.module('maps').config (
    ['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
    function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
        $stateProvider

        // Project List Page (Mine List)
        .state('maps', {
            url: '/map',
            templateUrl: 'modules/maps/client/views/map.html',
            data: {
                roles: ['admin']
            },
            resolve: {
                projects: function ($stateParams, ProjectModel) {
                    // if we need to filter, use ProjectModel.query({blah});
                    return ProjectModel.all();
                }
            },
            controller: 'controllerMap',
            controllerAs: 'projectsList'
        });
    }]);
