'use strict';

angular.module('tasks')
	.directive('tmplConfirmWithComment',  directiveTaskConfirmWithComment);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskConfirmWithComment.$inject = [];
/* @ngInject */
function directiveTaskConfirmWithComment() {
    var directive = {
        restrict: 'E',
        templateUrl: 'components/tasks/confirm-with-comment/confirm-with-comment.html',
        controller: 'controllerTaskConfirmWithComment',
        controllerAs: 'taskCwc',
        scope: {
        	anchor: '@',
        	item: '='
        }
    };
    return directive;
}