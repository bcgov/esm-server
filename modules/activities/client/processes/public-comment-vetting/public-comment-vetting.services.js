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
		return $http({method:'PUT',url: '/api/publiccomment/' + commentId + '/eao/defer'});
	};

	var setCommentPublish = function(commentId) {
		return $http({method:'PUT',url: '/api/publiccomment/' + commentId + '/eao/publish'});
	};

	var setCommentReject = function(comment) {
		return $http({method:'PUT',url: '/api/publiccomment/' + comment._id + '/eao/reject', data: comment});
	};

	var setCommentSpam = function(commentId) {
		return $http({method:'PUT',url: '/api/publiccomment/' + commentId + '/eao/spam'});
	};

	var getUnvettedCount = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/unvetted'});
	};


	var setDocumentDefer = function(documentId) {
		return $http({method:'PUT',url: '/api/commentdocument/' + documentId + '/eao/defer'});
	};

	var setDocumentPublish = function(documentId) {
		return $http({method:'PUT',url: '/api/commentdocument/' + documentId + '/eao/publish'});
	};

	var setDocumentReject = function(documentId) {
		return $http({method:'PUT',url: '/api/commentdocument/' + documentId + '/eao/reject'});
	};


	return {
		getStart: getStart,
		getNextComment: getNextComment,
		setCommentDefer: setCommentDefer,
		setCommentPublish: setCommentPublish,
		setCommentReject: setCommentReject,
		setCommentSpam: setCommentSpam,
		getUnvettedCount: getUnvettedCount,
		setDocumentDefer: setDocumentDefer,
		setDocumentPublish: setDocumentPublish,
		setDocumentReject: setDocumentReject
	};
}
