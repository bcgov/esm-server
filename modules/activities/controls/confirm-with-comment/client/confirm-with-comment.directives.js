'use strict';

angular.module('control')
	.directive('tmplConfirmWithComment',  directiveProcessConfirmWithComment);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessConfirmWithComment.$inject = [];
/* @ngInject */
function directiveProcessConfirmWithComment() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/controls/confirm-with-comment/client/confirm-with-comment.html',
        controller: 'controllerProcessConfirmWithComment',
        controllerAs: 'taskCwc',
        scope: {
        	anchor: '@',
        	item: '='
        }
    };
    return directive;
}
