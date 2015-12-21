'use strict';

angular.module('project')
	// EAO
	.controller('controllerEAOProject', controllerEAOProject)
	.controller('controllerEAOProjectNew', controllerEAOProjectNew)
	.controller('controllerEAOProjectIntake', controllerEAOProjectIntake)
	.controller('controllerModalProjectEdit', controllerModalProjectEdit)
	.controller('controllerModalProjectEditPlanSchedule', controllerModalProjectEditPlanSchedule);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Project Detail
//
// -----------------------------------------------------------------------------------
controllerEAOProject.$inject = ['$scope', 'Project', '$stateParams'];
//
function controllerEAOProject($scope, Project, $stateParams) {
	var vm = this;
	
	// show activities first
	vm.mainView = 'activity';
	//vm.activityView = 'all';
	vm.artifactView = 'inprogress';
	//
	// Get Project
	Project.getProject({id: $stateParams.id}).then(function(res) {
		vm.project = res.data;
	});

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: ERAO Project New
//
// -----------------------------------------------------------------------------------    
controllerEAOProjectNew.$inject = ['Project'];
//
function controllerEAOProjectNew(Project) {
	var projectNew = this;

	projectNew.questions = Project.getProjectIntakeQuestions();

	// Get blank project
	Project.getNewProject().then( function(res) {
		projectNew.project = res.data;
	});

	projectNew.saveProject = function() {
		Project.addProject(projectNew.project).then( function(res) {
			console.log(res);
		});
	};

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: ERAO Project New
//
// -----------------------------------------------------------------------------------    
controllerEAOProjectIntake.$inject = ['$state', 'Project', 'Configuration'];
//
function controllerEAOProjectIntake($state, Project, Configuration) {
	var projectIntake = this;

	projectIntake.questions = Project.getProjectIntakeQuestions();

	Project.getProject({id: $state.params.id}).then( function(res) {
		projectIntake.project = res.data;
	});

	Configuration.getStreams().then(function(res){
		projectIntake.streams = res.data;
	});

	projectIntake.setProjectStream = function() {
		if ((!projectIntake.project.stream || projectIntake.project.stream === '') && projectIntake.newStream) {
			Project.setProjectStream(projectIntake.project._id, projectIntake.newStream);
			$state.go('eao.project', {'id':projectIntake.project._id});
		}
	};
}  
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectEdit.$inject = ['$modalInstance', 'rProject', 'Utils', 'Project'];
//
function controllerModalProjectEdit($modalInstance, rProject, Utils, Project) { 
	var projectEdit = this;
	
	// set local var to passed project
	projectEdit.project = angular.copy(rProject);

	projectEdit.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	projectEdit.ok = function () {
		rProject = angular.copy(projectEdit.project);
		Project.saveProject(rProject);
		$modalInstance.close();
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectEditPlanMilestones.$inject = ['$modalInstance', 'rProject', 'Utils', '_'];
//
function controllerModalProjectEditPlanMilestones($modalInstance, rProject, Utils, _) { 
	var pestag = this;
	
	// remove a milestone from the temporary list.
	pestag.removeMilestoneFromProject = function(idx) {
		pestag.projectMilestones.splice(idx, 1);
	};

	// add the milestone to the project
	pestag.addMilestoneToProject = function(milestone) {
		pestag.projectMilestones.push(milestone);
	};


	// is the milestone already in the project?
	pestag.inProject = function(milestone) {
		return _.includes(pestag.projectMilestones, milestone);
	};
	
	// TODO: manually sort the milestone list.
	
	// set local var to passed project
	pestag.project = rProject;

	// copy the milestones so we can cancel the changes.
	pestag.projectMilestones = angular.copy(rProject.milestones) || [];

	Utils.getProjectMilestones().then( function(res) {
		pestag.allMilestones = res.data;
	});

	pestag.cancel = function () { $modalInstance.dismiss('cancel'); };
	pestag.ok = function () { 
		// saving so write the new data.
		rProject.milestones = angular.copy(pestag.projectMilestones);
		$modalInstance.close();
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Edit Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectEditPlanSchedule.$inject = ['$modalInstance', 'rProject', 'Project', '_'];
//
function controllerModalProjectEditPlanSchedule($modalInstance, rProject, Project, _) { 
	var pesched = this;
	
	var original = angular.copy(rProject.milestones);

	// set local var to passed project
	pesched.project = rProject;

	pesched.cancel = function () {
		pesched.project.milestones = original;
		$modalInstance.dismiss('cancel');
	};
	pesched.ok = function () { 
		// saving so write the new data.
		_.each(pesched.project.milestones, function(milestone) {
			console.log('this', milestone);
			if (milestone.changed) {
				Project.updateMilestone(milestone);
			}
		});

		$modalInstance.close();
	};	
}
