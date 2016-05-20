'use strict';

angular.module('control')
    .service('sProcessManageComments', serviceProcessManageComments);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceProcessManageComments.$inject = ['$http'];
/* @ngInject */
function serviceProcessManageComments($http) {
	var getAllPublishedComments = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/published'});
	};

	var getAllUnpublishedComments = function(projectId) {
		return $http({method:'GET',url: '/api/publiccomment/project/' + projectId + '/unpublished'});
	};

	return {
		getAllPublishedComments: getAllPublishedComments,
		getAllUnpublishedComments: getAllUnpublishedComments
	};
}
