'use strict';

angular.module('control')
	.directive('tmplPublicCommentPeriodScheduling',  directiveProcessPublicCommentPeriodScheduling);      
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
