'use strict';

angular.module('tasks')
    .service('PublicCommentVetting', servicePublicCommentVetting);
// -----------------------------------------------------------------------------------
//
// SERVICE: Public Comment Vetting
//
// -----------------------------------------------------------------------------------
servicePublicCommentVetting.$inject = ['$http'];
/* @ngInject */
function servicePublicCommentVetting($http) {

	var getStart = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/vett/start'});
	};
	
	var getNextComment = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/vett/claim'});
	};

	var setCommentDefer = function(commentId) {
		return $http({method:'GET',url: '/api/publiccomment/' + commentId + '/eao/defer'});
	};

	var setCommentPublish = function(commentId) {
		return $http({method:'GET',url: '/api/publiccomment/' + commentId + '/eao/publish'});
	};

	var setCommentReject = function(commentId) {
		return $http({method:'GET',url: '/api/publiccomment/' + commentId + '/eao/reject'});
	};


	return {
		getStart: getStart,
		getNextComment: getNextComment
	};
}
