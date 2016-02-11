'use strict';

angular.module('process')
    .run( initProcessEngageWG )
    .directive('tmplProcessEngageWG',  directiveProcessEngageWG);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessEngageWG.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessEngageWG(ProcessCodes) {
    ProcessCodes.push('Engage Working Group');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessEngageWG.$inject = [];
/* @ngInject */
function directiveProcessEngageWG() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/engagewg/client/engagewg.html',
        controller: 'controllerProcessEngageWG',
        controllerAs: 'processEngageWG',
        scope: {
            project: '='
        }
    };
    return directive;
}
