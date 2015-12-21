'use strict';

angular.module('tasks')
    .run( configTaskDecision )
    .directive('tmplDecision',  directiveTaskDecision);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskDecision.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskDecision(ProcessCodes) {
    ProcessCodes.push('Decision');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskDecision.$inject = [];
/* @ngInject */
function directiveTaskDecision() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/tasks/client/apps/decision/decision.html',
        controller: 'controllerTaskDecision',
        controllerAs: 'taskDecision',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}