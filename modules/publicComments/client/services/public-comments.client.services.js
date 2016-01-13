'use strict';

angular.module('publicComments')
    .service('sPublicComments', servicePublicComments);
// -----------------------------------------------------------------------------------
//
// SERVICE: Public Comment Vetting
//
// -----------------------------------------------------------------------------------
servicePublicComments.$inject = ['$http'];
/* @ngInject */
function servicePublicComments($http) {

	var getComment = function(commentId) {
		return $http({method:'GET',url: '/api/publiccomment/' + commentId });
	};

	var setCommentDefer = function(comment) {
		return $http({method:'PUT',url: '/api/publiccomment/' + comment._id + '/proponent/defer', data: comment});
	};

	var setCommentClassify = function(comment) {
		return $http({method:'PUT',url: '/api/publiccomment/' + comment._id + '/proponent/classify', data: comment});
	};

	return {
		getComment: getComment,
		setCommentDefer: setCommentDefer,
		setCommentClassify: setCommentClassify,
	};
}
