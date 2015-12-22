'use strict';

angular.module('tasks')
    .service('sTaskManageComments', serviceTaskManageComments);
// -----------------------------------------------------------------------------------
//
// SERVICE: ValueComponents templates
//
// -----------------------------------------------------------------------------------
serviceTaskManageComments.$inject = ['$http'];
/* @ngInject */
function serviceTaskManageComments($http) {
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