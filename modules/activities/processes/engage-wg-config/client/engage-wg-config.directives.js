'use strict';

angular.module('process')
    .run( initProcessEngageWGConfig )
    .directive('tmplProcessEngageWorkingGroupConfiguration',  directiveProcessEngageWGConfig);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessEngageWGConfig.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessEngageWGConfig(ProcessCodes) {
    ProcessCodes.push('Engage Working Group Configuration');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessEngageWGConfig.$inject = [];
/* @ngInject */
function directiveProcessEngageWGConfig() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/engage-wg-config/client/engage-wg-config.html',
        controller: 'controllerProcessEngageWGConfig',
        controllerAs: 'processEngageWGConfig',
        scope: {
            project: '=',
            activity: '='
        }
    };
    return directive;
}
