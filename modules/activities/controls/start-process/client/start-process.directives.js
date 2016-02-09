'use strict';

angular.module('control')
    .directive('tmplStartProcess',  directiveprocessestartProcess);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveprocessestartProcess.$inject = [];
/* @ngInject */
function directiveprocessestartProcess() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/client/processes/start-process/client/start-process.html',
        controller: 'controllerprocessestartProcess',
        controllerAs: 'processestartProcess',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
