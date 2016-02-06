'use strict';

angular.module('process')
    .run( configProcessPublicCommentVetting )
	.directive('tmplPublicCommentVetting',  directiveProcessPublicCommentVetting);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessPublicCommentVetting.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessPublicCommentVetting(ProcessCodes) {
    ProcessCodes.push('Public Comment Vetting');
}        
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessPublicCommentVetting.$inject = [];
/* @ngInject */
function directiveProcessPublicCommentVetting() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/public-comment-vetting/client/public-comment-vetting.html',
        controller: 'controllerProcessPublicCommentVetting',
        controllerAs: 'taskPubComVet',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='
        }
    };
    return directive;
}
