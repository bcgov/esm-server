'use strict';

angular.module('project').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

	$stateProvider
	.state('p', {
		url: '/p/:projectid',
		abstract: true,
		templateUrl: 'modules/projects/client/views/project.abstract.html',
		resolve: {
			project: function ($stateParams, ProjectModel) {
				// console.log ('loading project');
				if ($stateParams.projectid === 'new') {
					return ProjectModel.getNew ();
				} else {
					return ProjectModel.byCode ($stateParams.projectid);
				}
			},
			eaoAdmin: function (project) {
				return project.adminRole;
			},
			proponentAdmin: function (project) {
				return project.proponentAdminRole;
			}
		},
		controller: function ($scope, $stateParams, project, ENV, $rootScope, ProjectModel, Menus) {
			//console.log ('project permissions:', project.userCan);
			$scope.project = project;
			$scope.environment = ENV;
			$scope.isNew = ($stateParams.projectid === 'new');

			ProjectModel.setModel(project);

			$scope.intakeQuestions = ProjectModel.getProjectIntakeQuestions();


			var unbind = $rootScope.$on('refreshProject', function() {
				// console.log('refreshProject', $stateParams.projectid);
				$scope.project = angular.copy( ProjectModel.byCode ($stateParams.projectid) );
			});
			$scope.$on('$destroy',unbind);

		}
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.detail', {
		url: '/detail',
		templateUrl: 'modules/projects/client/views/project-partials/project.detail.html',
		controller: function ($scope, $state, project, ProjectModel, $window) {
			$scope.project = project;

			// complete the current phase.
			$scope.publishProject = function() {
				ProjectModel.publishProject( project ).then( function(res) {
					$scope.project = res;
					$state.go($state.current, {}, {reload: true});
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.edit', {
		url: '/edit',
		templateUrl: 'modules/projects/client/views/project-partials/project.entry.html',
		controller: 'controllerProjectEntry',
	})
	// -------------------------------------------------------------------------
	//
	// COMPLIANCE AND ENFORCEMENTS
	//
	// -------------------------------------------------------------------------
	.state('p.enforcements', {
		url: '/enforcements',
		templateUrl: 'modules/projects/client/views/project-partials/project.enforcements.html',
		controller: 'controllerProjectEntry',
	})

	// -------------------------------------------------------------------------
	//
	// the decision package mockup
	//
	// -------------------------------------------------------------------------
	.state('p.decision', {
		url: '/decision',
		templateUrl: 'modules/projects/client/views/project-partials/project.decision.html',
		controller: function ($scope, $state, project, ProjectModel) {

		}
	})
	.state('p.schedule', {
		url: '/schedule',
		templateUrl: 'modules/projects/client/views/project-partials/project.schedule.html',
		controller: function ($scope, $state, project, ProjectModel, MilestoneModel, PhaseModel, $rootScope, ArtifactModel, $modal, PhaseBaseModel) {
			var self = this;
			self.rSelPhase = undefined;
			self.rMilestonesForPhase = undefined;

			$scope.openDeleteMilestone = function(id) {
					$modal.open({
							animation: true,
							templateUrl: 'modules/projects/client/views/project-partials/project.schedule.delete.modal.html',
							controller: function ($modalInstance, MilestoneModel, $rootScope) {
								this.ok = function () {
									// Delete it
									MilestoneModel.deleteMilestone(id).then(
										function(res) {
											$modalInstance.dismiss('ok');
											$rootScope.$broadcast('refreshPhases', res);
										}
									);
								};
								this.cancel = function () {
									$modalInstance.dismiss('cancel');
								};
							},
							controllerAs: 'self',
							scope: $scope,
							size: 'lg'
					});
			};
			$scope.completeMilestone = function (milestoneId) {
				MilestoneModel.completeMilestone(milestoneId)
				.then(function (obj) {
					$rootScope.$broadcast('refreshPhases', obj);
				});
			};
			$scope.startMilestone = function (milestoneId) {
				MilestoneModel.startMilestone(milestoneId)
				.then(function (obj) {
					$rootScope.$broadcast('refreshPhases', obj);
				});
			};
			$scope.ok = function (obj) {
				MilestoneModel.save(obj).then(function (res) {
					// $modalInstance.dismiss();
				});
			};
			$scope.openEditMilestone = function(milestone) {
					var modalDocView = $modal.open({
							animation: true,
							templateUrl: 'modules/projects/client/views/project-partials/project.schedule.milestone.edit.modal.html',
							scope: $scope,
							resolve: {
								data: function (MilestoneModel) {
									return MilestoneModel.get('/api/milestone/'+milestone);
								}
							},
							controller: function ($modalInstance, MilestoneModel, data, $scope) {
								var myData = this;
								myData.data = data;
								myData.cancel = function () {
									$modalInstance.dismiss('cancel');
								};
								myData.ok = function () {
									MilestoneModel.save(myData.data).then(function (res) {
										$rootScope.$broadcast('refreshPhases', res);
										$modalInstance.close();
									}).catch(function (err) {
										$modalInstance.dismiss('cancel');
									});
								};
							},
							controllerAs: 'myData',
							size: 'lg'
					});
					modalDocView.result.then(function (data) {
						// Todo - update the item in the list
						// scope.data = data;
					}, function () {});
			};

			$scope.isNextPhase = function (id) {
				var index = -1;
				_.each($scope.project.phases, function(data, idx) {
				   if (_.isEqual(data._id, $scope.project.currentPhase._id)) {
				      index = idx;
				   }
				});
				// Double check if this is the last phase for errors
				if (index+1 >= $scope.project.phases.length)
					return false;
				if ($scope.project.phases[index+1]._id === id)
					return true;
			};

			$scope.startNextPhase = function () {
				ProjectModel.startNextPhase($scope.project)
					.then(function (res) {
						$scope.project = res;
						$scope.$apply();
					});
			};

			$scope.addPhase = function () {
				// Find out the current phase, add the one after that.
				PhaseBaseModel.getCollection()
					.then( function(res) {
						// TODO: Fix this! Naive implementation.
						var nextPhase = res[$scope.project.phases.length];
						return ProjectModel.addPhase(nextPhase.code);
					})
					.then( function(res) {
						$scope.project = res;
					});
			};

			$scope.deletePhase = function(phase) {
				// Remove Phase from project.
				return ProjectModel.removePhase($scope.project, phase)
					// .then(function(res) {
					// 	$scope.project = res;
					// 	// Delete Phase from database.
					// 	return PhaseModel.deleteId (phase._id);
					// })
					.then(function(res) {
						// Update model and UI.
						$scope.project = res;
						$scope.$apply();
					});
			};

			// User clicked on edit or delete phase - store this.
			$scope.selectPhase = function (phase) {
				$scope.selectedPhase = phase;
			};

			// Edit the phase data
			$scope.savePhaseDetail = function () {
				PhaseModel.save($scope.selectedPhase)
					.then( function (obj) {
						$rootScope.$broadcast('refreshPhases', obj);
					});
			};

			$scope.completePhase = function (phase) {
				// Complete this particular phase
				ProjectModel.completePhase($scope.project, phase)
					.then(function (res) {
						$scope.project = res;
						$scope.$apply();
					});
			};

			$scope.uncompletePhase = function (phase) {
				// Complete this particular phase
				ProjectModel.uncompletePhase($scope.project, phase)
					.then(function (res) {
						$scope.project = res;
						$scope.$apply();
					});
			};

			$scope.popluatePhaseDropdown = function (phase) {
				// console.log("populate phase on phase:",phase.code);
				$scope.rSelPhase = phase;
				$scope.rMilestonesForPhase = [];
				switch(phase.code) {
					case "pre-ea":
						$scope.rMilestonesForPhase = [
							{
								"code": 'new-project-initiated',
								"name": 'New Project Initiated'
							}, {
								"code": 'project-deemed-reviewable',
								"name": 'Project Deemed Reviewable'
							}, {
								"code": 'draft-project-description-submitted',
								"name": 'Draft Project Description Submitted'
							}, {
								"code": 'public-comment-period-on-project-description',
								"name": 'Public Comment Period on Project Description',
							}, {
								"name": "Project Description Accepted",
								"code": "project-description-accepted"
							}, {
								"name": "Substitution Decision",
								"code": "substitution-decision"
							}, {
								"code": 'section-6-order',
								"name": 'Section 6 Order'
							}, {
								"code": 'section-7-3-order',
								"name": 'Section 7(3) Order'
							}, {
								"code": 'section-10-1-a-order',
								"name": 'Section 10(1)(a) Order'
							}, {
								"code": 'section-10-1-b-order',
								"name": 'Section 10(1)(b) Order'
							}, {
								"code": 'section-10-1-b-fee',
								"name": 'Section 10(1)(b) Fee'
							}, {
								"name": "Section 10(1)c Order",
								"code": "section-10-1-c-order"
							}, {
								"code": 'section-31-1-order',
								"name": 'Section 31(1) Order - Vary the Assessment Process'
							}, {
								"code": 'section-34-1-order',
								"name": 'Section 34(1) Order - Cease or Remedy Activity'
							}];
						break;
					case "pre-app":
						$scope.rMilestonesForPhase = [{
								"name": "Section 11 Order",
								"code": "section-11-order"
							},{
								"code": 'section-15-order',
								"name": 'Section 15 Order - s.14 variance'
							},{
								"code": 'section-14-order',
								"name": 'Section 14 Order'
							},{
								"code": 'section-13-order',
								"name": 'Section 13 Order - s.11 variance'
							}, {
								"name": "Assessment Fee - Installment 1",
								"code": "assessment-fee-installment-1"
							}, {
								"name": "Draft AIR Accepted",
								"code": "draft-air-accepted"
							}, {
								"name": "Pre-App PCP Initiated",
								"code": "pre-app-pcp-initiated"
							}, {
								"name": "AIR Finalized and Approved",
								"code": "air-finalized-and-approved"
							}, {
								"code": 'assessment-suspension',
								"name": 'Assessment Suspension - s.30.1'
							}, {
								"code": 'section-31-1-order',
								"name": 'Section 31(1) Order - Vary the Assessment Process'
							}, {
								"code": 'section-34-1-order',
								"name": 'Section 34(1) Order - Cease or Remedy Activity'
							},{
								"code": 'assessment-suspension',
								"name": 'Assessment Suspension - s.30.1',
							},{
								"code": 'project-termination',
								"name": 'Project Termination - s.24.3',
							},{
								"code": 'vc-finalized-and-approved',
								"name": 'VC Finalized and Approved',
							},{
								"code": 'pre-app-pcp-completed',
								"name": 'Pre-App PCP Completed',
							},{
								"code": 'pre-app-open-house-completed',
								"name": 'Pre-App Open House Completed',
							},{
								"code": 'draft-vc-ready-for-commenting',
								"name": 'Draft VC Ready for Commenting',
							},{
								"code": 'working-group-formed',
								"name": 'Working Group Formed',
							},{
								"code": 'announce-project',
								"name": 'Announce Project',
							}];
						break;
					case "evaluation":
						$scope.rMilestonesForPhase = [
							{
								"name": "Application Evaluation",
								"code": "application-evaluation"
							}, {
								"name": "Draft Application Submitted",
								"code": "draft-application-submitted"
							}, {
								"name": "Assessment Fee - Installment 2",
								"code": "assessment-fee-installment-2"
							}, {
								"code": 'section-13-order',
								"name": 'Section 13 Order - s.11 variance'
							}, {
								"code": 'section-15-order',
								"name": 'Section 15 Order - s.14 variance'
							}, {
								"code": 'project-termination',
								"name": 'Project Termination - s.24.3',
							}, {
								"code": 'section-31-1-order',
								"name": 'Section 31(1) Order - Vary the Assessment Process'
							}, {
								"code": 'section-34-1-order',
								"name": 'Section 34(1) Order - Cease or Remedy Activity'
							},  {
								"code": 'assessment-suspension',
								"name": 'Assessment Suspension - s.30.1',
							}, {
								"code": 'time-limit-extension-s-24-4',
								"name": 'Time Limit Extension - s.24.4',
							}, {
								"code": 'time-limit-suspension-s-24-2',
								"name": 'Time Limit Suspension - s.24.2',
							}, {
								"code": 'time-limit-suspension-s-30-2',
								"name": 'Time Limit Suspension - s.30.2',
							}];
						break;
					case "application-review":
						$scope.rMilestonesForPhase = [
							{
								"name": "Application Accepted",
								"code": "application-accepted"
							}, {
								"name": "Review PCP Initiated",
								"code": "review-pcp-initiated"
							}, {
								"name": "Referral Package",
								"code": "referral-package"
							}, {
								"code": 'application-review-pcp-completed',
								"name": 'Review PCP Completed',
							}, {
								"code": 'application-review-open-house-completed',
								"name": 'Review Open House Completed',
							}, {
								"code": 'section-13-order',
								"name": 'Section 13 Order - s.11 variance'
							}, {
								"code": 'section-15-order',
								"name": 'Section 15 Order - s.14 variance'
							}, {
								"code": 'project-termination',
								"name": 'Project Termination - s.24.3',
							}, {
								"code": 'section-31-1-order',
								"name": 'Section 31(1) Order - Vary the Assessment Process'
							}, {
								"code": 'section-34-1-order',
								"name": 'Section 34(1) Order - Cease or Remedy Activity'
							},  {
								"code": 'assessment-suspension',
								"name": 'Assessment Suspension - s.30.1',
							}, {
								"code": 'time-limit-extension-s-24-4',
								"name": 'Time Limit Extension - s.24.4',
							}, {
								"code": 'time-limit-suspension-s-24-2',
								"name": 'Time Limit Suspension - s.24.2',
							}, {
								"code": 'time-limit-suspension-s-30-2',
								"name": 'Time Limit Suspension - s.30.2',
							}
						  ];
						break;
					case "decision":
						$scope.rMilestonesForPhase = [
							{
								"name": "Minister's Decision",
								"code": "ministers-decision"
							}, {
								"name": "Minister's Decision Package Delivered",
								"code": "ministers-decision-package-delivered"
							}, {
								"code": 'project-termination',
								"name": 'Project Termination - s.24.3',
							}, {
								"code": 'section-31-1-order',
								"name": 'Section 31(1) Order - Vary the Assessment Process'
							}, {
								"code": 'section-34-1-order',
								"name": 'Section 34(1) Order - Cease or Remedy Activity'
							},  {
								"code": 'assessment-suspension',
								"name": 'Assessment Suspension - s.30.1',
							}, {
								"code": 'time-limit-extension-s-24-4',
								"name": 'Time Limit Extension - s.24.4',
							}, {
								"code": 'time-limit-suspension-s-24-2',
								"name": 'Time Limit Suspension - s.24.2',
							}, {
								"code": 'time-limit-suspension-s-30-2',
								"name": 'Time Limit Suspension - s.30.2',
							}];
						break;
					case "post-certification":
						$scope.rMilestonesForPhase = [
							{
								"name": "Certificate Issued - s.17",
								"code": "certificate-issued-s.17"
							}, {
								"name": "Substantially Started Decision",
								"code": "substantially-started-decision"
							}, {
								"code": 'section-31-1-order',
								"name": 'Section 31(1) Order - Vary the Assessment Process'
							}, {
								"code": 'section-34-1-order',
								"name": 'Section 34(1) Order - Cease or Remedy Activity'
							},{
								"code": 'ea-certificate-extension',
								"name": 'EA Certificate Extension',
							},{
								"code": 'ea-certificate-extension-fee',
								"name": 'EA Certificate Extension Fee',
							},{
								"code": 'ea-certificate-amendment',
								"name": 'EA Certificate Amendment',
							},{
								"code": 'ea-certificate-amendment-fee',
								"name": 'EA Certificate Amendment Fee',
							},{
								"code": 'ea-certificate-amendment-pcp-initiated',
								"name": 'EA Certificate Amendment PCP Initiated',
							},{
								"code": 'ea-certificate-amendment-open-house-completed',
								"name": 'EA Certificate Amendment Open House Completed',
							},{
								"code": 'ea-certificate-amendment-pcp-completed',
								"name": 'EA Certificate Amendment PCP Completed',
							},{
								"code": 'ea-certificate-cancellation-s-37-1',
								"name": 'EA Certificate Cancellation - s.37.1',
							},{
								"code": 'ea-certificate-expired-s-18-5',
								"name": 'EA Certificate Expired - s.18.5',
							},{
								"code": 'ea-certificate-suspension-s-37-1',
								"name": 'EA Certificate Suspension - s.37.1',
							}];
						break;
				}
				// Add this to everything except:
				if (phase.code !== 'post-certification') {
					$scope.rMilestonesForPhase.push(
						{
							"name": "Project Withdrawn",
							"code": "project-withdrawn"
						});
				}
				// Always add free-text version
				$scope.rMilestonesForPhase.push(
					{
						"name": "Custom Milestone",
						"code": "custom-milestone"
					});
				$scope.selectedMilestoneType = $scope.rMilestonesForPhase[0];
			};

			$scope.selectedAMilestone = function(item) {
				if (item) {
					if (item.code === 'custom-milestone') {
						// Disable the free-text
						$scope.showCustom = true;
					} else {
						// Enable the free-text
						$scope.showCustom = false;
					}
				}
			};

			// Handle the add milestone
			$scope.addMilestone = function(selectedMilestone, dateStarted, dateCompleted, duration) {
				// Just add a milestone, attach it to a specific phase - this is a generic
				// schedule, which really doesn't follow the flow of anything.  It's just a
				// Marker of sorts.  We will need to look this up when phases/milestones progress
				// through the flow of the business in order to delete/reset these milestones.
				// For now, this becomes a 'look ahead' schedule that staff can use to view
				// the project 'plan'

				var oneDay = (1000 * 60 * 60 * 24);
				var numberOfDays = 90;
				if (dateCompleted && dateStarted) {
					numberOfDays = Math.floor((dateCompleted - dateStarted) / oneDay);
				}

				// If they add a custom milestone, override the code and name here.
				if (selectedMilestone.code === 'custom-milestone') {
					selectedMilestone.code = $scope.customMilestoneText;
					selectedMilestone.name = $scope.customMilestoneText;
				}
				MilestoneModel.add({
					"code": selectedMilestone.code,
					"name": selectedMilestone.name,
					"phase": $scope.rSelPhase,
					"dateStartedEst": dateStarted,
					"dateCompletedEst": dateCompleted,
					"duration": numberOfDays
				})
				.then(function (ms) {
					$scope.rSelPhase.milestone = ms;
					$scope.rSelPhase.milestones.push(ms);
					return PhaseModel.save($scope.rSelPhase);
				})
				.then( function (phase) {
					// console.log("newphase:", phase);
					$rootScope.$broadcast('refreshPhases');
				});
			};
			// Handle the delete milestone
			$scope.selectedMilestone = function (milestone, phase) {
				// console.log("selected milestone: ", MilestoneModel);
				// console.log("selected phase:", $scope.rSelPhase);
				self.selMilestone = milestone;
				MilestoneModel.get(milestone).then(function (res) {
					// console.log("Milestone with activities data:",res);
					$scope.data = res;
					$scope.$apply();
				});
			};
			$scope.editMilestone = function (milestone, phase) {
				self.selMilestone = milestone;
				// Hack until we put into the service
				MilestoneModel.get('/api/milestone/'+milestone).then(function (res) {
					// console.log("Milestone with activities data:",res);
					$scope.data = res;
					$scope.$apply();
				});
			};
		}
	});
}]);











