'use strict';

angular.module('activity')
	.controller('controllerEAOActivity', controllerEAOActivity)
	.controller('controllerEAOActivityDetail', controllerEAOActivityDetail)
	.controller('controllerEAOActivityTasks', controllerEAOActivityTasks)
	.controller('controllerEAOActivityProcesses', controllerEAOActivityProcesses)
	.controller('controllerModalAddCustomTask', controllerModalAddCustomTask);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Activity EAO
//
// -----------------------------------------------------------------------------------
controllerEAOActivity.$inject = ['$scope', '$state', '$modal', 'Activity', 'Project', '$stateParams'];
//
function controllerEAOActivity($scope, $state, $modal, Activity, Project, $stateParams) {
	var actBase = this;
	//
	// Get Activity
	Activity.getProjectActivity({id: $state.params.id}).then(function(res) {
		actBase.activity = res.data;
		//
		// Get Project
		Project.getProject({id: res.data.project}).then(function(res) {
			actBase.project = res.data;
		});
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Activity Detail
//
// -----------------------------------------------------------------------------------
controllerEAOActivityDetail.$inject = ['$scope', 'moment', '$rootScope', 'Task', '_'];
//
function controllerEAOActivityDetail($scope, moment, $rootScope, Task, _) {
	var actDetail = this;
	actDetail.tasks = [];
	actDetail.currentTask = '';

	var getTasks = function() {
		if (actDetail.activity && actDetail.project) {
			_.each(actDetail.project.tasks, function(task) {
				if (task.activity === actDetail.activity._id) {
					actDetail.tasks.push(task);
				}
			});
		}
	};

	$scope.$watch('activity', function(newValue) {
		actDetail.activity = newValue;
		getTasks();
	});
	
	$scope.$watch('project', function(newValue) {
		actDetail.project = newValue;
		getTasks();
	});


	// when a task is marked complete, refresh the list.
	$rootScope.$on('resolveTask', function(event, task) {
		task.status = 'Complete';
		task.dateComplete = moment();

		Task.updateTask(task);
	});



}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Activity Tasks
//
// -----------------------------------------------------------------------------------
controllerEAOActivityTasks.$inject = ['$scope', '$rootScope', '$filter', 'moment', 'Task', '$modal'];
//
function controllerEAOActivityTasks($scope, $rootScope, $filter, moment, Task, $modal) {
	var actTasks = this;
	actTasks.form = {};
	actTasks.tasks = {};

	$scope.$watch('tasks', function(newValue) {
		if(newValue) actTasks.tasks = newValue;
	});

	$scope.$watch('activity', function(newValue) {
		if(newValue) actTasks.activity = newValue;
	});
	
	$scope.$watch('project', function(newValue) {
		if(newValue) actTasks.project = newValue;
	});

	// change the task value with a click
	actTasks.taskChange = function(item, project, $event) {
		// find the current value in values
		// altkey only
		if ($event.altKey && !$event.shiftKey) {
			item.status = "Not Required";
			return;
		}
		
		// set current item
		actTasks.form.currentTask = item.code + '-' + item._id;
		// send the current task seletion to the process column
		$rootScope.$broadcast('activateTask', {'task': actTasks.form.currentTask });			


		// find the current value profile.
		// if shiftkey is down, iterate the status	
		if (!$event.altKey && $event.shiftKey) {
			switch(item.status) {
				case 'Not Started':
					item.status = 'In Progress';
					break;
				case 'In Progress':
					item.status = 'Not Started';
					break;
				case 'Complete':
					item.status = 'In Progress';
					break;
			}
		}

		Task.updateTask(item);

	};

	actTasks.addCustomTask = function() {

	};

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Activity Tasks
//
// -----------------------------------------------------------------------------------
controllerEAOActivityProcesses.$inject = ['$scope', '$rootScope'];
//
function controllerEAOActivityProcesses($scope, $rootScope) {
	var actProcs = this;

	actProcs.form = {};
	actProcs.form.currentTask = '';

	$rootScope.$on('activateTask', function(event, args) {
		actProcs.form.currentTask = args.task;
	});


	$scope.$watch('tasks', function(newValue) {
		if (newValue) {
			console.log('process task', newValue);
			actProcs.tasks = newValue;
		}
	});

	$scope.$watch('activity', function(newValue) {
		actProcs.activity = newValue;
	});
	
	$scope.$watch('project', function(newValue) {
		actProcs.project = newValue;
	});

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal Add Custom Task
//
// -----------------------------------------------------------------------------------
controllerModalAddCustomTask.$inject = ['$modalInstance', 'ProcessCodes', 'Configuration', 'Project', 'rActivity', 'rTasks'];
//
function controllerModalAddCustomTask($modalInstance, ProcessCodes, Configuration, Project, rActivity, rTasks) {
	var customTask = this;
	
	customTask.processCodes = ProcessCodes;

	Configuration.newConfigItem('task').then( function(res) {
		customTask.activeRecord = res.data;
	});

	customTask.ok = function () { 

		Configuration.addConfigItem(customTask.activeRecord, 'task').then( function(res) {
			Project.addTaskToActivity(rActivity._id, res.data._id).then( function(res) {
				rTasks.push(res.data);
				$modalInstance.close();
			});
		});
	
	};
	customTask.cancel = function () { $modalInstance.dismiss('cancel'); };
	
}
