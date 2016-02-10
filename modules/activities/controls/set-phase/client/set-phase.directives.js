'use strict';

angular.module('control')
    .directive('tmplSetPhase',  directiveprocessesetPhase);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveprocessesetPhase.$inject = [];
/* @ngInject */
function directiveprocessesetPhase() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/controls/set-phase/client/set-phase.html',
        controller: 'controllerprocessesetPhase',
        controllerAs: 'processesetPhase',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
