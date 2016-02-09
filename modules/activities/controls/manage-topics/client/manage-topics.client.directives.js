'use strict';

angular.module('process')
    .run( configProcessTopics )
    .directive('tmplManageTopics',  directiveProcessTopics);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessTopics.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessTopics(ProcessCodes) {
    ProcessCodes.push('Manage Topics');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessTopics.$inject = [];
/* @ngInject */
function directiveProcessTopics() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/manage-topics/client/manage-topics.html',
        controller: 'controllerProcessTopics',
        controllerAs: 'taskTopics',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
