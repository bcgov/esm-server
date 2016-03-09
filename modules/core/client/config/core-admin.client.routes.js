'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        templateUrl: 'modules/core/client/views/admin.abstract.html',
        data: {
          roles: ['admin']
        },
        controller: function ($scope, Authentication) {
          console.log ('auth = ', Authentication);
          $scope.authentication = Authentication;
        }
      })
      .state('admin.top', {
        url: '/admin',
        templateUrl: 'modules/core/client/views/admin.top.html',
        data: {
          roles: ['admin']
        }
      });
  }
]);
