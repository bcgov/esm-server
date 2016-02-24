'use strict';

angular.module('process')
    .run( initProcessFederalSub )
    .directive('tmplProcessFederalSubstitution',  directiveProcessFederalSub);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessFederalSub.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessFederalSub(ProcessCodes) {
    ProcessCodes.push('Federal Substitution');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessFederalSub.$inject = [];
/* @ngInject */
function directiveProcessFederalSub() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/federal-substitution/client/federal-substitution.html',
        controller: 'controllerProcessFederalSub',
        controllerAs: 'processFedSub',
        scope: {
            project: '='
        }
    };
    return directive;
}
