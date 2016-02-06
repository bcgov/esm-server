'use strict';

angular.module('process')
    .run( configProcessPublicCommentPeriodScheduling )
	.directive('tmplPublicCommentPeriodScheduling',  directiveProcessPublicCommentPeriodScheduling);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessPublicCommentPeriodScheduling.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessPublicCommentPeriodScheduling(ProcessCodes) {
    ProcessCodes.push('Public Comment Period Scheduling');
}        
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessPublicCommentPeriodScheduling.$inject = [];
/* @ngInject */
function directiveProcessPublicCommentPeriodScheduling() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/public-comment-period-scheduling/client/public-comment-period-scheduling.html',
        controller: 'controllerProcessPublicCommentPeriodScheduling',
        controllerAs: 'taskPubComSched',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='
        }
    };
    return directive;
}
