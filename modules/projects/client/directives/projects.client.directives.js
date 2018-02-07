'use strict';

angular.module('projects')
  .directive('tmplProjectsList', directiveProjectsList)
  .directive('tmplProjectsList2', directiveProjectsList2)
  .directive('tmplProjectsSearch', directiveProjectsSearch)
  .directive('tmplProjectsMap', directiveProjectsMap);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects List
//
// -----------------------------------------------------------------------------------
function directiveProjectsList() {
  var directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'modules/projects/client/views/projects-partials/projects-list.html',
    controller: 'controllerProjectsList',
    controllerAs: 'projectList',
    scope: {
      projects: '='
    }
  };
  return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects List
//
// -----------------------------------------------------------------------------------
function directiveProjectsList2 () {
  var directive = {
    restrict: 'E',
    templateUrl: 'modules/projects/client/views/projects-partials/projects-list.html',
    controller: 'controllerProjectsList2',
    controllerAs: 'projectList',
    scope: {
      projects: '=',
      title: '='
    }
  };
  return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Search
//
// -----------------------------------------------------------------------------------
function directiveProjectsSearch() {
  var directive = {
    restrict: 'E',
    templateUrl: 'modules/projects/client/views/projects-partials/projects-search.html',
    controller: 'controllerProjectsSearch',
    controllerAs: 'projectsSearch'
  };
  return directive;
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Projects Map
//
// -----------------------------------------------------------------------------------
function directiveProjectsMap() {
  var directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'modules/projects/client/views/projects-partials/projects-map.html',
    controller: 'controllerProjectsList',
    controllerAs: 'projectList',
    scope: {
      projects: '='
    }
  };
  return directive;
}
