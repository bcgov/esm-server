'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentPeriodScheduling', controllerTaskPublicCommentPeriodScheduling);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentPeriodScheduling.$inject = ['$scope', '$rootScope', 'moment', 'Project', '_'];
	//
function controllerTaskPublicCommentPeriodScheduling($scope, $rootScope, moment, Project, _) {
	var taskPubComSched = this;

	taskPubComSched.data = {
		startDate: null,
		endDate: null,
		openHouses: [
		// 	{
		// 		location: "1234 Main Street \nSmallville, BC",
		// 		dateScheduled: "Wed Dec 16 2015 10:30:00 GMT-0800 (PST)"
		// 	},
		// 	{
		// 		location: "1234 Main Avenue \nBigtown, BC",
		// 		dateScheduled: "Wed Dec 16 2015 10:30:00 GMT-0800 (PST)"
		// 	},
		],
		showScopeTopicAddButton: true
	};

	taskPubComSched.deleteOpenHouse = function(oh) {
		_.remove(taskPubComSched.data.openHouses, function(item) {
			return item.dateScheduled === oh.dateScheduled;
		});
	};

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