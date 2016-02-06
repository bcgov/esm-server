'use strict';

angular.module('process')
    .run( configprocessestartProcess )
    .directive('tmplStartProcess',  directiveprocessestartProcess);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configprocessestartProcess.$inject = ['ProcessCodes'];
/* @ngInject */
function configprocessestartProcess(ProcessCodes) {
    ProcessCodes.push('Start Process');
}
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
