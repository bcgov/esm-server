'use strict';

angular.module('control')
	.directive('tmplConfirmNoComment',  directiveProcessConfirmNoComment);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessConfirmNoComment.$inject = [];
/* @ngInject */
function directiveProcessConfirmNoComment() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/confirm-no-comment/client/confirm-no-comment.html',
        controller: 'controllerProcessConfirmNoComment',
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
