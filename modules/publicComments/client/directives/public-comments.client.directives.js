'use strict';

angular.module('publicComments')
	.directive('tmplClassifyPublicComment',  directiveClassifyPublicComment)
    .directive('modalAddPublicComment', directiveModalAddPublicComment);
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
            project: '=',
            single: '='
        }
    };
    return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal add public comment
//
// -----------------------------------------------------------------------------------
directiveModalAddPublicComment.$inject = ['$modal'];
/* @ngInject */
function directiveModalAddPublicComment($modal) {
    var directive = {
        restrict:'A',
        scope: {
            project: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function() {
                var modalAddComment = $modal.open({
                    animation: true,
                    templateUrl: 'modules/projects/client/views/project-partials/modal-add-public-comment.html',
                    controller: 'controllerModalAddComment',
                    controllerAs: 'publicComment',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        rProject: function() { return scope.project; }
                    },
                    size: 'md'
                });
                modalAddComment.result.then(function () {}, function () {});
            });
        }
    };
    return directive;
}
