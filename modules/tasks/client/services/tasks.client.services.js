'use strict';

angular.module('tasks')
	.service('Task', serviceTasks);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceTasks.$inject = ['$http'];
/* @ngInject */
function serviceTasks($http) {
	// var getTaskData = function(req) {
	// 	return $http({method:'GET',url + '/v1/task/' + req.code + '/' + req.id});
	// };

	var updateTask = function(req) {
		return $http({method:'PUT',url: 'api/task/' + req._id, data: req});
	};

	return {
		updateTask: updateTask
	};
}
