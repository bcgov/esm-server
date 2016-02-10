'use strict';

angular.module('control')
    .service('ProcessPublicCommentClassificationProponent', serviceProcessPublicCommentClassificationProponent);
// -----------------------------------------------------------------------------------
//
// SERVICE: Public Comment Vetting
//
// -----------------------------------------------------------------------------------
serviceProcessPublicCommentClassificationProponent.$inject = ['$http'];
/* @ngInject */
function serviceProcessPublicCommentClassificationProponent($http) {

	var getStart = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/classify/start'});
	};
	
	var getNextComment = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/classify/claim'});
	};

	var getUnclassifiedCount = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/unclassified'});
	};

	return {
		getStart: getStart,
		getNextComment: getNextComment,
		getUnclassifiedCount: getUnclassifiedCount
	};
}
