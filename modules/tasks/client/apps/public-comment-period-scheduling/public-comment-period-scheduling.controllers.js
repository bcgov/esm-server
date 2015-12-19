'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentPeriodScheduling', controllerTaskPublicCommentPeriodScheduling);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentPeriodScheduling.$inject = ['$scope', '$rootScope', 'moment', 'Project'];
	//
function controllerTaskPublicCommentPeriodScheduling($scope, $rootScope, moment, Project) {
	var taskPubComSched = this;

	taskPubComSched.data = {
		startDate: null,
		endDate: null,
		scopeTopics: [
			{
				_id: 123,
				text:"value 1",
				edit:false,
				delete: false
			},
			{
				_id: 456,
				text:"value 2",
				edit:false,
				delete: false
			},
			{
				_id: 789,
				text:"value 3",
				edit:false,
				delete: false
			},
		],
		openHouses: [
			{
				location: "1234 Main Street \nSmallville, BC",
				dateScheduled: "Wed Dec 16 2015 10:30:00 GMT-0800 (PST)"
			},
			{
				location: "1234 Main Avenue \nBigtown, BC",
				dateScheduled: "Wed Dec 16 2015 10:30:00 GMT-0800 (PST)"
			},
		],
		showScopeTopicAddButton: true
	};

	taskPubComSched.addRowToScopeTopics = function() {
		taskPubComSched.data.scopeTopics.push({ text:taskPubComSched.data.newScopeTopic, edit:false });
		taskPubComSched.data.newScopeTopic = "";
		taskPubComSched.data.showScopeTopicAddButton = true;
	}

	taskPubComSched.editScopeTopicsRow = function(index) {
		taskPubComSched.data.scopeTopics[index].newText = taskPubComSched.data.scopeTopics[index].text;
		taskPubComSched.data.scopeTopics[index].edit=true;
	}

	taskPubComSched.editScopeTopicsRowOkay = function(index) {
		taskPubComSched.data.scopeTopics[index].text = taskPubComSched.data.scopeTopics[index].newText;
		taskPubComSched.data.scopeTopics[index].newText = '';
		taskPubComSched.data.scopeTopics[index].edit=false;
	}

	taskPubComSched.editScopeTopicsRowCancel = function(index) {
		taskPubComSched.data.scopeTopics[index].newText = '';
		taskPubComSched.data.scopeTopics[index].edit=false;
	}

	taskPubComSched.deleteScopeTopicsRow = function(item) {
		_.remove(taskPubComSched.data.scopeTopics, function(obj) {
			return obj._id === item._id;
		});
	}

	taskPubComSched.deleteScopeTopicsRowConfirm = function(index) {
		taskPubComSched.data.scopeTopics.splice(index,1);
	}
	taskPubComSched.deleteScopeTopicsRowCancel = function(index) {
		taskPubComSched.data.scopeTopics[index].delete = false;
	}
	taskPubComSched.deleteOpenHouse = function(oh) {
		_.remove(taskPubComSched.data.openHouses, function(item) {
			return item.dateScheduled === oh.dateScheduled;
		});
	}

	// get the task identifier.  (ID + Task Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskPubComSched.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskPubComSched.taskId = newValue._id;
			taskPubComSched.task = newValue;
		}
	});

	// get the project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComSched.project = newValue;

			// TODO: also need to save it to the task
			taskPubComSched.data.startDate = newValue.dateCommentsOpen;
			taskPubComSched.data.endDate = newValue.dateCommentsClosed;
		}
	});

	taskPubComSched.saveTask = function() {
		//save this task
		var saveProject = false;
		if (moment(taskPubComSched.data.startDate).isValid()) {
			taskPubComSched.project.dateCommentsOpen = taskPubComSched.data.startDate;
			saveProject = true;
		}
		if (moment(taskPubComSched.data.endDate).isValid()) {
			taskPubComSched.project.dateCommentsClosed = taskPubComSched.data.endDate;
			saveProject = true;
		}
		if (saveProject) {
			Project.saveProject(taskPubComSched.project).then( function(res) {
				console.log( 'saved', res.data );
			});
		}

	};

	taskPubComSched.completeTask = function() {
		taskPubComSched.saveTask();
		$rootScope.$broadcast('resolveTask', taskPubComSched.task);
	};

}