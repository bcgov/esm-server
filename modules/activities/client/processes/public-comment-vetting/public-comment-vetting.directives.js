'use strict';

angular.module('tasks')
    .run( configTaskPublicCommentVetting )
	.directive('tmplPublicCommentVetting',  directiveTaskPublicCommentVetting);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskPublicCommentVetting.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskPublicCommentVetting(ProcessCodes) {
    ProcessCodes.push('Public Comment Vetting');
}        
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskPublicCommentVetting.$inject = [];
/* @ngInject */
function directiveTaskPublicCommentVetting() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/public-comment-vetting/public-comment-vetting.html',
        controller: 'controllerTaskPublicCommentVetting',
        controllerAs: 'taskPubComVet',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='
        }
    };
    return directive;
}