'use strict';

angular.module('control')
	.directive('tmplPublicCommentVetting',  directiveProcessPublicCommentVetting);
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
        templateUrl: 'modules/activities/controls/public-comment-vetting/client/public-comment-vetting.html',
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
