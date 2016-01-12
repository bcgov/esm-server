'use strict';

angular.module('publicComments')
	.directive('tmplClassifyPublicComment',  directiveClassifyPublicComment);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveClassifyPublicComment.$inject = [];
/* @ngInject */
function directiveClassifyPublicComment() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/publicComments/client/views/partials/public-comments-classification.html',
        controller: 'controllerClassifyPublicComment',
        controllerAs: 'pubComClass',
        scope: {
        	comment: '=',
            project: '='                
        }
    };
    return directive;
}