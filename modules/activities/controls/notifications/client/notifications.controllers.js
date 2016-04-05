'use strict';

angular.module('control')
	.controller('controllerProcessNotifications', controllerProcessNotifications);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessNotifications.$inject = ['$scope', '$rootScope', 'sProcessNotifications', '$q', 'ProcessCodes', '_'];
	//
function controllerProcessNotifications($scope, $rootScope, sProcessNotifications, $q, ProcessCodes, _) {

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
						taskNotifications.recipients[role.role].viaEmail.push(member);
					}
					if (member.viaMail) {
						taskNotifications.recipients[role.role].viaMail.push(member);
						taskNotifications.mailOut.push(member);
					}
				});
			});

			taskNotifications.taskData = {'status': 'pending'};

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


	sProcessNotifications.getTemplates().then( function(res) {
		taskNotifications.templates = res.data;
	});

	taskNotifications.setContent = function() {
		taskNotifications.taskData.mailContent = taskNotifications.selectedTemplate.content;
	};

}
