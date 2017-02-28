'use strict';

angular.module('maps').config (
    ['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
    function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
        $stateProvider

        // Project List Page (Mine List)
        .state('maps', {
            url: '/map',
            templateUrl: 'modules/maps/client/views/map.html',
            params: {
                project: null
            },
            data: {},
            controller: 'controllerMap',
            controllerAs: 'projectsList'
        });
    }]);
