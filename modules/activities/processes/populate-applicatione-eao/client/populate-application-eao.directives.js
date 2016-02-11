'use strict';

angular.module('process')
    .run( initProcessPopulateApplicationEAO )
    .directive('tmplProcessPopulateApplicationEao', directiveProcessPopulateApplicationEAO);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessPopulateApplicationEAO.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessPopulateApplicationEAO(ProcessCodes) {
    ProcessCodes.push('Populate Application EAO');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessPopulateApplicationEAO.$inject = [];
/* @ngInject */
function directiveProcessPopulateApplicationEAO() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/populate-application-eao/client/populate-application-eao.html',
        controller: 'controllerProcessPopulateApplicationEAO',
        controllerAs: 'processPopulateApplicationEAO',
        scope: {
            project: '='
        }
    };
    return directive;
}
