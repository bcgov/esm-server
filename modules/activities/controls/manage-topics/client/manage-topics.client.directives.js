'use strict';

angular.module('control')
    .directive('tmplManageTopics',  directiveProcessTopics);
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
