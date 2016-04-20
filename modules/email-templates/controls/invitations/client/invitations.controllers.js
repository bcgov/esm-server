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

  taskInvitations.project = $scope.project;

  taskInvitations.templates = [];

  taskInvitations.taskData = {'subject': undefined, 'content': undefined};

  taskInvitations.users = [];
  taskInvitations.selected = [];

  // maybe we will have more invitation roles...
  taskInvitations.roles = [$scope.project.inviteeRole];
  taskInvitations.selectedRole = $scope.project.inviteeRole;


	sProcessInvitations.getTemplates().then(function(res) {
    taskInvitations.templates = res.data;
	});

	taskInvitations.setContent = function() {
    taskInvitations.taskData.subject = taskInvitations.selectedTemplate.subject;
    taskInvitations.taskData.content = taskInvitations.selectedTemplate.content;
	};
  
  taskInvitations.setUsers = function() {
    sProcessInvitations.getUsersForRole(taskInvitations.selectedRole).then(function(res) {
      taskInvitations.users = (res.data) ? res.data.users :[];
      taskInvitations.selected = [];
    });   
  };

  var doMoveUser = function(src, dest, user) {
    if( _.contains(src, user) ) {
      _.remove(src, function(item) {
        return item === user;
      });

      if(!_.includes(dest, user)) {
        dest.push(user);
      }
    }
  };

  taskInvitations.inSelected = function(user) {
    return _.includes(taskInvitations.selected, user);
  };

  taskInvitations.inUsers = function(user) {
    return _.includes(taskInvitations.users, user);
  };

  taskInvitations.moveUser = function(user) {
    var src = taskInvitations.inUsers(user) ? taskInvitations.users : taskInvitations.selected;
    var dest = taskInvitations.inUsers(user) ? taskInvitations.selected : taskInvitations.users;

    doMoveUser(src, dest, user);
  };

  // get the selected roles users on load.
  this.setUsers();


}
