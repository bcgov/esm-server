'use strict';

angular.module('process')
    .run( initProcessApproveAIR )
    .directive('tmplProcessApproveAir', directiveProcessApproveAIR);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessApproveAIR.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessApproveAIR(ProcessCodes) {
    ProcessCodes.push('Approve AIR');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessApproveAIR.$inject = [];
/* @ngInject */
function directiveProcessApproveAIR() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/approve-air/client/approve-air.html',
        controller: 'controllerProcessApproveAIR',
        controllerAs: 'processApproveAIR',
        scope: {
            project: '='
        }
    };
    return directive;
}
