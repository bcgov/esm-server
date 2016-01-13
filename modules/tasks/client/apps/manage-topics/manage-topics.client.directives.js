'use strict';

angular.module('tasks')
    .run( configTaskTopics )
    .directive('tmplManageTopics',  directiveTaskTopics);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskTopics.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskTopics(ProcessCodes) {
    ProcessCodes.push('Manage Topics');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskTopics.$inject = [];
/* @ngInject */
function directiveTaskTopics() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/tasks/client/apps/manage-topics/manage-topics.html',
        controller: 'controllerTaskTopics',
        controllerAs: 'taskTopics',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
