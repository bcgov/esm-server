'use strict';

angular.module('tasks')
	.controller('controllerTaskManageComments', controllerTaskManageComments);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskManageComments.$inject = ['$scope', '$rootScope', 'Task', '_', 'sTaskManageComments', 'Authentication'];
	//
function controllerTaskManageComments($scope, $rootScope, Task, _, sTaskManageComments, Authentication) {

	var taskManComm = this;

	taskManComm.comments = [];

	// watch project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskManComm.project = newValue;
			// make a copy so changes aren't bound to the underlying screens.
			sTaskManageComments.getAllPublishedComments(newValue._id).then( function(res) {
				_.each(res.data, function(item) {
					taskManComm.comments.push(item);
				});

				if (_.contains(Authentication.user.roles, 'admin')) {
					sTaskManageComments.getAllUnpublishedComments(newValue._id).then( function(res) {
						_.each(res.data, function(item) {
							taskManComm.comments.push(item);
						});
					});
				}

			});
		}
	});

	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskManComm.taskAnchor = newValue;
		}
	});


	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskManComm.taskId = newValue._id;
			taskManComm.task = newValue;
		}
	});


	taskManComm.panelSort = [
		{'field': 'dateAdded', 'name':'Date'},
		{'field': 'overallStatus', 'name':'Overall Status'},
		{'field': 'eaoStatus', 'name':'EAO Status'},
		{'field': 'proponentStatus', 'name':'Proponent Status'}
	];




	// taskNotification.completeTask = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskManComm.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskManageComments.itemId});
	// }
	
}    