// 'use strict';

// angular.module('project')
	// EAO
	// .controller('controllerEAOProject', controllerEAOProject)
	// .controller('controllerEAOProjectNew', controllerEAOProjectNew)

	// .controller('controllerModalProjectEdit', controllerModalProjectEdit)
	// .controller('controllerModalProjectEditPlanSchedule', controllerModalProjectEditPlanSchedule);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Project Detail
//
// -----------------------------------------------------------------------------------
// controllerEAOProject.$inject = ['$scope', 'Project', '$stateParams'];
// /* @ngInject */
// function controllerEAOProject($scope, Project, $stateParams) {
// 	var vm = this;

// 	// show activities first
// 	vm.mainView = 'activity';
// 	//vm.activityView = 'all';
// 	vm.artifactView = 'inprogress';
// 	//
// 	// Get Project
// 	Project.getProject({id: $stateParams.id}).then(function(res) {
// 		vm.project = res.data;
// 	});

// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Project New
//
// -----------------------------------------------------------------------------------
// controllerEAOProjectNew.$inject = ['Project', '$state'];
// /* @ngInject */
// function controllerEAOProjectNew(Project, $state) {
// 	var projectEntry = this;

// 	projectEntry.questions = Project.getProjectIntakeQuestions();
// 	projectEntry.form = {curTab:''};

// 	// Get blank project
// 	Project.getNewProject().then( function(res) {
// 		projectEntry.project = res.data;
// 	});

// 	projectEntry.submitProject = function() {
// 		projectEntry.project.status = 'Submitted';
// 		projectEntry.saveProject();
// 	};

// 	projectEntry.saveProject = function() {
// 		Project.addProject(projectEntry.project).then( function(res) {
// 			// go to the edit page for the same project.
// 			// this time provide a tab for continuty
// 			$state.go('eao.editproject', { id: res.data._id, tab: projectEntry.form.curTab });
// 		});
// 	};

// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
// controllerModalProjectEdit.$inject = ['$modalInstance', 'rProject', 'Utils', 'Project'];
// /* @ngInject */
// function controllerModalProjectEdit($modalInstance, rProject, Utils, Project) {
// 	var projectEdit = this;

// 	// set local var to passed project
// 	projectEdit.project = angular.copy(rProject);

// 	projectEdit.cancel = function () {
// 		$modalInstance.dismiss('cancel');
// 	};
// 	projectEdit.ok = function () {
// 		rProject = angular.copy(projectEdit.project);
// 		Project.saveProject(rProject);
// 		$modalInstance.close();
// 	};
// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
// controllerModalProjectEditPlanMilestones.$inject = ['$modalInstance', 'rProject', 'Utils', '_'];
// /* @ngInject */
// function controllerModalProjectEditPlanMilestones($modalInstance, rProject, Utils, _) {
// 	var pestag = this;

// 	// remove a milestone from the temporary list.
// 	pestag.removeMilestoneFromProject = function(idx) {
// 		pestag.projectMilestones.splice(idx, 1);
// 	};

// 	// add the milestone to the project
// 	pestag.addMilestoneToProject = function(milestone) {
// 		pestag.projectMilestones.push(milestone);
// 	};


// 	// is the milestone already in the project?
// 	pestag.inProject = function(milestone) {
// 		return _.includes(pestag.projectMilestones, milestone);
// 	};

// 	// TODO: manually sort the milestone list.

// 	// set local var to passed project
// 	pestag.project = rProject;

// 	// copy the milestones so we can cancel the changes.
// 	pestag.projectMilestones = angular.copy(rProject.milestones) || [];

// 	Utils.getProjectMilestones().then( function(res) {
// 		pestag.allMilestones = res.data;
// 	});

// 	pestag.cancel = function () { $modalInstance.dismiss('cancel'); };
// 	pestag.ok = function () {
// 		// saving so write the new data.
// 		rProject.milestones = angular.copy(pestag.projectMilestones);
// 		$modalInstance.close();
// 	};
// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Edit Project Schedule
//
// -----------------------------------------------------------------------------------
// controllerModalProjectEditPlanSchedule.$inject = ['$modalInstance', 'rProject', 'Project', '_'];
// /* @ngInject */
// function controllerModalProjectEditPlanSchedule($modalInstance, rProject, Project, _) {
// 	var pesched = this;

// 	var original = angular.copy(rProject.milestones);

// 	// set local var to passed project
// 	pesched.project = rProject;

// 	pesched.cancel = function () {
// 		pesched.project.milestones = original;
// 		$modalInstance.dismiss('cancel');
// 	};
// 	pesched.ok = function () {
// 		// saving so write the new data.
// 		_.each(pesched.project.milestones, function(milestone) {
// 			// console.log('this', milestone);
// 			if (milestone.changed) {
// 				Project.updateMilestone(milestone);
// 			}
// 		});

// 		$modalInstance.close();
// 	};
// }
