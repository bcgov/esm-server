'use strict';

angular.module('process')
    .run( initProcessDraftAIR )
    .directive('tmplProcessDraftAir', directiveProcessDraftAIR);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessDraftAIR.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessDraftAIR(ProcessCodes) {
    ProcessCodes.push('Draft AIR');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessDraftAIR.$inject = [];
/* @ngInject */
function directiveProcessDraftAIR() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/draft-air/client/draft-air.html',
        controller: 'controllerProcessDraftAIR',
        controllerAs: 'processDraftAIR',
        scope: {
            project: '='
        }
    };
    return directive;
}
