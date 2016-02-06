'use strict';

angular.module('process')
    .run( configProcessManageComments )
    .directive('tmplManageComments',  directiveProcessManageComments)
    .directive('modalCommentDetail', directiveModalCommentDetail);
// -----------------------------------------------------------------------------------
//
// Config: register this task with the UI
//
// -----------------------------------------------------------------------------------
configProcessManageComments.$inject = ['ProcessCodes'];
/* @ngInject */
function configProcessManageComments(ProcessCodes) {
    ProcessCodes.push('Manage Comments');
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Process, simple complete
//
// -----------------------------------------------------------------------------------
directiveProcessManageComments.$inject = [];
/* @ngInject */
function directiveProcessManageComments() {
    var directive = {
        restrict: 'E',
        templateUrl: 'modules/activities/processes/manage-comments/client/manage-comments.html',
        controller: 'controllerProcessManageComments',
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
directiveModalCommentDetail.$inject = ['$modal', 'sPublicComments', '_'];
/* @ngInject */
function directiveModalCommentDetail($modal, sPublicComments, _) {
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
                    templateUrl: 'modules/activities/processes/manage-comments/client/modal-comment-detail.html',
                    controller: 'controllerProcessModalCommentDetail',
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
