'use strict';

angular.module('process')
    .run( initProcessAnnounceProject )
    .directive('tmplProcessAnnounceProject', directiveProcessAnnounceProject);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
initProcessAnnounceProject.$inject = ['ProcessCodes'];
/* @ngInject */
function initProcessAnnounceProject(ProcessCodes) {
    ProcessCodes.push('Announce Project');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE
//
// -----------------------------------------------------------------------------------
directiveProcessAnnounceProject.$inject = [];
/* @ngInject */
function directiveProcessAnnounceProject() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/announce-project/client/announce-project.html',
        controller: 'controllerProcessAnnounceProject',
        controllerAs: 'ProcessAnnounceProject',
        scope: {
            project: '='
        }
    };
    return directive;
}
