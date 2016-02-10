'use strict';

angular.module('process')
    .run( initProcessAnnounce )
    .directive('tmplProcessAnnounce',  directiveProcessAnnounce);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessAnnounce.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessAnnounce(ProcessCodes) {
    ProcessCodes.push('Announce');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessAnnounce.$inject = [];
/* @ngInject */
function directiveProcessAnnounce() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/announce/client/announce.html',
        controller: 'controllerProcessAnnounce',
        controllerAs: 'processAnnounce',
        scope: {
            project: '='
        }
    };
    return directive;
}
