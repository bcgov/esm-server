'use strict';

angular.module('tasks')
    .run( configTaskValueComponents )
    .directive('tmplManageValueComponents',  directiveTaskValueComponents);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskValueComponents.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskValueComponents(ProcessCodes) {
    ProcessCodes.push('Manage Value Components');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskValueComponents.$inject = [];
/* @ngInject */
function directiveTaskValueComponents() {
    var directive = {
        restrict: 'E',
        templateUrl: 'components/tasks/manage-value-components/manage-value-components.html',
        controller: 'controllerTaskValueComponents',
        controllerAs: 'taskValueComponents',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
