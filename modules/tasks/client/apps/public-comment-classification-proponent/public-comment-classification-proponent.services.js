'use strict';

angular.module('tasks')
    .service('TaskPublicCommentClassificationProponent', serviceTaskPublicCommentClassificationProponent);
// -----------------------------------------------------------------------------------
//
// SERVICE: Public Comment Vetting
//
// -----------------------------------------------------------------------------------
serviceTaskPublicCommentClassificationProponent.$inject = ['$http'];
/* @ngInject */
function serviceTaskPublicCommentClassificationProponent($http) {

	var getStart = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/classify/start'});
	};
	
	var getNextComment = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/classify/claim'});
	};

	var setCommentDefer = function(comment) {
		return $http({method:'PUT',url: '/api/publiccomment/' + comment._id + '/proponent/defer', data: comment});
	};

	var setCommentClassify = function(comment) {
		return $http({method:'PUT',url: '/api/publiccomment/' + comment._id + '/proponent/classify', data: comment});
	};

	var getUnclassifiedCount = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/unclassified'});
	};

	return {
		getStart: getStart,
		getNextComment: getNextComment,
		setCommentDefer: setCommentDefer,
		setCommentClassify: setCommentClassify,
		getUnclassifiedCount: getUnclassifiedCount
	};
}
