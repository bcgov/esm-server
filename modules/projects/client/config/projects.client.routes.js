'use strict';

angular.module('projects').config (
  ['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
    function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
      $stateProvider
      // =========================================================================
      //
      // New Project Routes
      //
      // =========================================================================
        .state('projects', {
          url: '/',
          templateUrl: 'modules/projects/client/views/projects.abstract.html',
          cache: false,
          resolve: {
            projects: function(ProjectModel) {
              // Temporary relocate once we de-couple the front end from the back-end.
              // This short-circuits the old admin home-page for prod only.
              if (window.location.hostname === 'projects.eao.gov.bc.ca') {
                window.location.href = 'http://www.projects.eao.gov.bc.ca';
                return null;
              }
              // Otherwsie, load the projects!
              return ProjectModel.published();
            }
          },
          controller: function ($cookies, Utils, $scope, $stateParams, ENV, projects, Authentication, Application) {
            $scope.projects = projects;
            $scope.environment = ENV;
            $scope.authentication = Authentication;
            $scope.Application = Application;
            $scope.filterObj = {};
            $scope.seenOnce = $cookies.get('seenOnce');
            if (!$scope.seenOnce) {
              var now = new Date();
              $cookies.put('seenOnce', true, {expires: new Date(now.getFullYear()+1, now.getMonth(), now.getDate())});
            }
          }
        })
      // -------------------------------------------------------------------------
      //
      // the scheudle view for all projects
      //
      // -------------------------------------------------------------------------
        .state('projects.schedule', {
          data: {},
          url: 'schedule',
          templateUrl: 'modules/projects/client/views/projects-partials/projects-schedule.html',
          controller: function ($scope, projects) {
            $scope.projects = projects;
            $scope.allPhases = _.sortBy(_.unique(_.flatten(_.map(projects, function(proj) {
              return _.map(proj.phases, 'name');
            }))));
          }
        });
    }]);
