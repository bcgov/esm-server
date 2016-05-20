'use strict';

angular.module('control')
    .directive('tmplSetPhase',  directiveProcessSetPhase);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessSetPhase.$inject = [];
/* @ngInject */
function directiveProcessSetPhase() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/controls/set-phase/client/set-phase.html',
        controller: 'controllerProcessSetPhase',
        controllerAs: 'processSetPhase',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
