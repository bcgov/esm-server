'use strict';

angular.module('process')
    .run( initProcessSection11 )
    .directive('tmplProcessSection11',  directiveProcessSection11);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessSection11.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessSection11(ProcessCodes) {
    ProcessCodes.push('Section 11');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessSection11.$inject = [];
/* @ngInject */
function directiveProcessSection11() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/section11/client/section11.html',
        controller: 'controllerProcessSection11',
        controllerAs: 'processSection11',
        scope: {
            project: '='
        }
    };
    return directive;
}
