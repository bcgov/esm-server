'use strict';

angular.module('tasks')
	.directive('tmplConfirmNoComment',  directiveTaskConfirmNoComment);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskConfirmNoComment.$inject = [];
/* @ngInject */
function directiveTaskConfirmNoComment() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/confirm-no-comment/confirm-no-comment.html',
        controller: 'controllerTaskConfirmNoComment',
        controllerAs: 'taskCnc',
        scope: {
        	anchor: '@',
        	item: '='
        },
        link: function(scope, element, attrs) {
            console.log('in item', scope.item);
        }
    };
    return directive;
}