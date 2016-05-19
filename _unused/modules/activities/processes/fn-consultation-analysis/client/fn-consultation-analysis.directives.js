'use strict';

angular.module('process')
    .run( initProcessFNConsultationAnalysis )
    .directive('tmplProcessFnConsultationAnalysis', directiveProcessFNConsultationAnalysis);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessFNConsultationAnalysis.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessFNConsultationAnalysis(ProcessCodes) {
    ProcessCodes.push('FN Consultation Analysis');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessFNConsultationAnalysis.$inject = [];
/* @ngInject */
function directiveProcessFNConsultationAnalysis() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/fn-consultation-analysis/client/fn-consultation-analysis.html',
        controller: 'controllerProcessFNConsultationAnalysis',
        controllerAs: 'processFNConsultationAnalysis',
        scope: {
            project: '='
        }
    };
    return directive;
}
