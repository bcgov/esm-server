'use strict';

angular.module('control')
	.directive('tmplPublicCommentClassificationProponent',  directiveProcessPublicCommentClassificationProponent);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessPublicCommentClassificationProponent.$inject = [];
/* @ngInject */
function directiveProcessPublicCommentClassificationProponent() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/public-comment-classification-proponent/client/public-comment-classification-proponent.html',
        controller: 'controllerProcessPublicCommentClassificationProponent',
        controllerAs: 'taskPubComClassProp',
        scope: {
        	anchor: '@',
        	task: '=',
            project: '='                
        }
    };
    return directive;
}
