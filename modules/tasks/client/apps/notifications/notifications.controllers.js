'use strict';

angular.module('tasks')
	.controller('controllerTaskNotifications', controllerTaskNotifications);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskNotifications.$inject = ['$scope', '$rootScope', 'Task', 'Notification', '$q', 'ProcessCodes'];
	//
function controllerTaskNotifications($scope, $rootScope, Task, Notification, $q, ProcessCodes) {
	

	var taskNotifications = this;

	taskNotifications.mailOut = [];

	// watch projoect
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskNotifications.project = newValue;

			taskNotifications.recipients = {};
			// get recipients sorted to groups

			_.each(newValue.team, function(member, idx1){
				_.each(member.systemRole, function(role, idx2){
					if (!taskNotifications.recipients[role.role]) taskNotifications.recipients[role.role] = {viaEmail: [], viaMail: []};
					if (member.viaEmail) {
						taskNotifications.recipients[role.role]['viaEmail'].push(member);
					}
					if (member.viaMail) {
						taskNotifications.recipients[role.role]['viaMail'].push(member);
						taskNotifications.mailOut.push(member);
					}
				});
			});

		}
	});


	// bind customRecipients to the watch.
	$scope.$watch(angular.bind(this, function () {
		return this.customRecipients;
	}), function (newValue) {
		_.each(newValue, function(member, idx1){
			if (!taskNotifications.recipients.adhoc) taskNotifications.recipients.adhoc = {viaEmail: [], viaMail: []};
			if (member.viaEmail) {
				taskNotifications.recipients.adhoc.viaEmail.push(member);
			}
			if (member.viaMail) {
				taskNotifications.recipients.adhoc.viaMail.push(member);
				if (!_.include(taskNotifications.mailOut, member)) {
					taskNotifications.mailOut.push(member);
				}
			}
		});
	});


	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskNotifications.taskAnchor = newValue;
		}
	});

	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskNotifications.taskId = newValue._id;
			taskNotifications.task = newValue;
			// get task data or blank if no record exists.
			// Task.getTaskData({'code':newValue.code, 'id':newValue._id}).then( function(res) {
			// 	taskNotifications.taskData = res.data;
			// });
		}
	});

	Notification.getTemplates().then( function(res) {
		taskNotifications.templates = res.data;
	});

	taskNotifications.setContent = function() {
		taskNotifications.taskData.mailContent = taskNotifications.selectedTemplate.content;
	}

	taskNotifications.saveTask = function() {
		// structure the data to save.
		//Notifications.saveTask();
		console.log('save notifications.controllers.js');
	}

	// taskNotification.completeTask = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskNotifications.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskNotifications.itemId});
	// }
	
}