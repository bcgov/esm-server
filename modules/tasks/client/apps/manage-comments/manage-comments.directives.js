'use strict';

angular.module('tasks')
    .run( configTaskManageComments )
    .directive('tmplManageComments',  directiveTaskManageComments)
    .directive('modalCommentDetail', directiveModalCommentDetail);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configTaskManageComments.$inject = ['ProcessCodes'];
/* @ngInject */
function configTaskManageComments(ProcessCodes) {
    ProcessCodes.push('Manage Comments');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Task, simple complete
//
// -----------------------------------------------------------------------------------
directiveTaskManageComments.$inject = [];
/* @ngInject */
function directiveTaskManageComments() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/tasks/client/apps/manage-comments/manage-comments.html',
        controller: 'controllerTaskManageComments',
        controllerAs: 'taskManComm',
        scope: {
            anchor: '@',
            task: '=',
            project: '='
        }
    };
    return directive;
}


// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Research Detail
//
// -----------------------------------------------------------------------------------
directiveModalCommentDetail.$inject = ['$modal', 'sPublicComments'];
/* @ngInject */
function directiveModalCommentDetail($modal, sPublicComments) {
    var directive = {
        restrict:'A',
        scope : {
            comment: '=',
            project: '='
        },
        link : function(scope, element, attrs) {
            element.on('click', function() {
                var modalCommentDetail = $modal.open({
                    animation: true,
                    templateUrl: 'modules/tasks/client/apps/manage-comments/modal-comment-detail.html',
                    controller: 'controllerTaskModalCommentDetail',
                    controllerAs: 'taskComDetail',
                    scope: scope,
                    size: 'lg',
                    resolve: {
                        rComment: function() {
                            return angular.copy(scope.comment);
                        },
                        rProject: function() {
                            return scope.project;
                        }
                    }
                });
                modalCommentDetail.result.then(function () {}, function () {

                    sPublicComments.getComment(scope.comment._id).then( function(res) {
                        // reassign the new, saved comment
                        scope.comment = _.assign(scope.comment, res.data);
                    });

                });
            });
        }
    };
    return directive;
}
