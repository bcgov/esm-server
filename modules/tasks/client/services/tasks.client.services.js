'use strict';

angular.module('tasks')
	.service('Task', serviceTasks);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Projects Main
//
// -----------------------------------------------------------------------------------
serviceTasks.$inject = ['$http', 'SERVERAPI'];
/* @ngInject */
function serviceTasks($http, SERVERAPI) {
	// var getTaskData = function(req) {
	// 	return $http({method:'GET',url: SERVERAPI + '/v1/task/' + req.code + '/' + req.id});
	// };

	var updateTask = function(req) {
		return $http({method:'PUT',url: SERVERAPI + '/task/' + req._id, data: req});
	};

	return {
		updateTask: updateTask
	};
}
