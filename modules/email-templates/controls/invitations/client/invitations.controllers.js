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
  taskInvitations.roles = [$scope.project.eaoInviteeRole, $scope.project.proponentInviteeRole];
  taskInvitations.selectedRole = undefined;


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
  
  taskInvitations.sendInvitations = function() {
    if (taskInvitations.canSend()) {
      var userIds = taskInvitations.selected.map(function (s) {
        return s._id.toString();
      });
      var data = {
        url: window.location.origin,
        subject: taskInvitations.taskData.subject,
        content: taskInvitations.taskData.content,
        projectId: taskInvitations.project._id.toString(),
        userIds: userIds
      };

      sProcessInvitations.sendInvitations(data).then(function (res) {
        // res.data will return an array of:
        //email: user.email
        //userId: user._id
        //messageId: returned from SMTP server, id of message sent
        //accepted: true/false, true if delivered
        //rejected: true/false, true if rejected (invalid email address).
        //
        // not sure how to best to raise this and show it...
        // TODO: match userIds for accepted and rejected, show message on screen
        //console.log(res);
      });
    }
  };

  taskInvitations.canSend = function() {
    return _.size(taskInvitations.selected) > 0 &&
      !_.isEmpty(taskInvitations.taskData.subject) &&
      !_.isEmpty(taskInvitations.taskData.content);
  };

  // get the selected roles users on load.
  this.setUsers();


}
