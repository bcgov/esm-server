'use strict';

angular.module('tasks')
    .run( configTaskSetPhase )
    .directive('tmplSetPhase',  directiveTaskSetPhase);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskSetPhase.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskSetPhase(ProcessCodes) {
    ProcessCodes.push('Set Phase');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskSetPhase.$inject = [];
/* @ngInject */
function directiveTaskSetPhase() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/set-phase/set-phase.html',
        controller: 'controllerTaskSetPhase',
        controllerAs: 'taskSetPhase',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}