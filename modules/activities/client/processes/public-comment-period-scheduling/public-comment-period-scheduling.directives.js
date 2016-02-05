'use strict';

angular.module('tasks')
    .run( configTaskPublicCommentPeriodScheduling )
	.directive('tmplPublicCommentPeriodScheduling',  directiveTaskPublicCommentPeriodScheduling);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskPublicCommentPeriodScheduling.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskPublicCommentPeriodScheduling(ProcessCodes) {
    ProcessCodes.push('Public Comment Period Scheduling');
}        
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskPublicCommentPeriodScheduling.$inject = [];
/* @ngInject */
function directiveTaskPublicCommentPeriodScheduling() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/public-comment-period-scheduling/public-comment-period-scheduling.html',
        controller: 'controllerTaskPublicCommentPeriodScheduling',
        controllerAs: 'taskPubComSched',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='
        }
    };
    return directive;
}
