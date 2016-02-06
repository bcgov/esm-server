'use strict';

angular.module('process')
    .run( configProcessPublicCommentClassificationProponent )
	.directive('tmplPublicCommentClassificationProponent',  directiveProcessPublicCommentClassificationProponent);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessPublicCommentClassificationProponent.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessPublicCommentClassificationProponent(ProcessCodes) {
    ProcessCodes.push('Public Comment Classification Proponent');
}        
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
