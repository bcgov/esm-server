'use strict';

angular.module('control')
    .run( configProcessDecision )
    .directive('tmplDecision',  directiveProcessDecision);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessDecision.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessDecision(ProcessCodes) {
    ProcessCodes.push('Decision');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessDecision.$inject = [];
/* @ngInject */
function directiveProcessDecision() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/decision/client/decision.html',
        controller: 'controllerProcessDecision',
        controllerAs: 'taskDecision',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}
