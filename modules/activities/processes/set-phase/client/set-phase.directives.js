'use strict';

angular.module('process')
    .run( configprocessesetPhase )
    .directive('tmplSetPhase',  directiveprocessesetPhase);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configprocessesetPhase.$inject = ['ProcessCodes'];
/* @ngInject */
function configprocessesetPhase(ProcessCodes) {
    ProcessCodes.push('Set Phase');
}
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
        templateUrl: 'modules/activities/processes/set-phase/client/set-phase.html',
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
