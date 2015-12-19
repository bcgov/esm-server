'use strict';

angular.module('tasks')
    .run( configTaskStartProcess )
    .directive('tmplStartProcess',  directiveTaskStartProcess);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskStartProcess.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskStartProcess(ProcessCodes) {
    ProcessCodes.push('Start Process');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskStartProcess.$inject = [];
/* @ngInject */
function directiveTaskStartProcess() {
    var directive = {
        restrict: 'E',
        templateUrl: 'components/tasks/start-process/start-process.html',
        controller: 'controllerTaskStartProcess',
        controllerAs: 'taskStartProcess',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
