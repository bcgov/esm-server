'use strict';

angular.module('publicComments')


// -------------------------------------------------------------------------
//
// directive to simply view a comment in detail
//
// -------------------------------------------------------------------------

.directive('viewCommentDetail', function ($modal, _) {
    return {
        restrict:'A',
        scope : {
            comment: '=',
            project: '='
        },
        link : function (scope, element, attrs) {
            element.on ('click', function () {
                $modal.open ({
                    animation: true,
                    templateUrl: 'modules/publicComments/client/views/listing/modal.comment.detail.html',
                    controllerAs: 'd',
                    scope: scope,
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {
                    	var d = this;
                    	d.project = $scope.project;
                    	d.comment = $scope.comment;
                    	d.pillars = _.unique(_.pluck(d.comment.buckets, 'group'));
                    	d.topics  = _.pluck(d.comment.buckets, 'name');
                    	d.cancel = function () { $modalInstance.close (); };
                    },
                });
            });
        }
    };
})

;
