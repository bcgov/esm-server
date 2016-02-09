'use strict';

angular.module('process')
    .run( initProcessSection101c )
    .directive('tmplProcessSection101c',  directiveProcessSection101c);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
processSection101c.$inject = ['ProcessCodes'];
/* @ngInject */
function configprocessestartProcess(ProcessCodes) {
    ProcessCodes.push('Section 101c');
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
