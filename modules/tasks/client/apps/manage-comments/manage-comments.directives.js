'use strict';

angular.module('tasks')
    .run( configTaskManageComments )
    .directive('tmplManageComments',  directiveTaskManageComments);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskManageComments.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskManageComments(ProcessCodes) {
    ProcessCodes.push('Manage Comments');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskManageComments.$inject = [];
/* @ngInject */
function directiveTaskManageComments() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/tasks/client/apps/manage-comments/manage-comments.html',
        controller: 'controllerTaskManageComments',
        controllerAs: 'taskManageComments',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
