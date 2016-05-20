'use strict';

angular.module('process')
    .run( initProcessPopulateApplicationWG )
    .directive('tmplProcessPopulateApplicationWg',  directiveProcessPopulateApplicationWG);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessPopulateApplicationWG.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessPopulateApplicationWG(ProcessCodes) {
    ProcessCodes.push('Populate Application WG');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessPopulateApplicationWG.$inject = [];
/* @ngInject */
function directiveProcessPopulateApplicationWG() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/populate-application-wg/client/populate-application-wg.html',
        controller: 'controllerProcessPopulateApplicationWG',
        controllerAs: 'processPopulateApplicationWG',
        scope: {
            project: '='
        }
    };
    return directive;
}
