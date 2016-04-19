'use strict';

angular.module('control')
	.controller('controllerProcessInvitations', controllerProcessInvitations);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessInvitations.$inject = ['$scope', '$rootScope', 'sProcessInvitations', '$q', 'ProcessCodes', '_'];
	//
function controllerProcessInvitations($scope, $rootScope, sProcessInvitations, $q, ProcessCodes, _) {

	var taskInvitations = this;

  taskInvitations.mailOut = [];
  taskInvitations.taskData = {'status': 'pending', 'content': undefined};

	// watch project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
      taskInvitations.project = newValue;

      taskInvitations.recipients = {};
			// get recipients sorted to groups

			_.each(newValue.team, function(member, idx1){
				_.each(member.systemRole, function(role, idx2){
					if (!taskInvitations.recipients[role.role]) taskInvitations.recipients[role.role] = {viaEmail: [], viaMail: []};
					if (member.viaEmail) {
            taskInvitations.recipients[role.role].viaEmail.push(member);
					}
					if (member.viaMail) {
            taskInvitations.recipients[role.role].viaMail.push(member);
            taskInvitations.mailOut.push(member);
					}
				});
			});

      taskInvitations.taskData = {'status': 'pending'};

		}
	});

	$scope.addRecipients = function(data, parent) {
		console.log(data);
		this.customRecipients = data;
	};


	// bind customRecipients to the watch.
	$scope.$watch(angular.bind(this, function () {
		return this.customRecipients;
	}), function (newValue) {
		_.each(newValue, function(member, idx1){
			if (!taskInvitations.recipients.adhoc) taskInvitations.recipients.adhoc = {viaEmail: [], viaMail: []};
			if (member.viaEmail) {
        taskInvitations.recipients.adhoc.viaEmail.push(member);
			}
			if (member.viaMail) {
        taskInvitations.recipients.adhoc.viaMail.push(member);
				if (!_.include(taskInvitations.mailOut, member)) {
          taskInvitations.mailOut.push(member);
				}
			}
		});
	});


	sProcessInvitations.getTemplates().then( function(res) {
    taskInvitations.templates = res.data;
	});

	taskInvitations.setContent = function() {
    taskInvitations.taskData.content = taskInvitations.selectedTemplate.content;
	};

}
