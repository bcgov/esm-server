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
				//console.log ('> loading project /p id = ' + $stateParams.projectid);
				if ($stateParams.projectid === 'new') {
					return ProjectModel.getNew ();
				} else {
					return ProjectModel.byCode ($stateParams.projectid);
				}
			},
			eaoAdmin: function () {
				return '';//project.adminRole;
			},
			proponentAdmin: function () {
				return '';//project.proponentAdminRole;
			}
		},
		controller: function ($scope, $stateParams, project, ENV, $rootScope, ProjectModel, Menus) {
			//console.log ('< loaded project /p id = ' + $stateParams.projectid + ', userCan = ', JSON.stringify(project.userCan));
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

		},
		data: { }
	})
	// -------------------------------------------------------------------------
	//
	// the detail view of a project
	//
	// -------------------------------------------------------------------------
	.state('p.detail', {
		url: '/detail',
		templateUrl: 'modules/projects/client/views/project-partials/project.detail.html',
		resolve: {
			project: function ($stateParams, ProjectModel) {
				return ProjectModel.byCode ($stateParams.projectid);
			},
			activeperiod: function ($stateParams, CommentPeriodModel, project) {
				if (!project) { return null; }
				// Go through the periods on the project, surface the active one and enable commenting
				// right from here.
				// The following code is duplicated in commentperiod.routes.js
				return CommentPeriodModel.forProject (project._id)
				.then( function (periods) {
					var openPeriod = null;
					_.each(periods, function (period) {
						if (period.openState.state === CommentPeriodModel.OpenStateEnum.open) {
							openPeriod = period;
							return false;
						}
					});
					if (openPeriod) {
						// console.log("Found open period:", openPeriod);
						return openPeriod;
					} else {
						return null;
					}
				});
			}
		},controller: function ($scope, $state, project, ProjectModel, $window, activeperiod) {
			$scope.project = project;
			$scope.activeperiod = null;

			if (activeperiod) {
				// Switch on the UI for comment period
				// console.log("activeperiod:", activeperiod);
				$scope.activeperiod = activeperiod;
				$scope.allowCommentSubmit = (activeperiod.userCan.addComment) || activeperiod.userCan.vetComments;
			}

			// complete the current phase.
			$scope.publishProject = function() {
				ProjectModel.publishProject( project ).then( function(res) {
					$scope.project = res;
					$state.go($state.current, {}, {reload: true});
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
		data: { }
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

			$scope.milestonesForPhases = {};

			function addMilestonesToPhase (milestones) {
				milestones.forEach(function(milestone) {
					if (!(milestone.phase in $scope.milestonesForPhases)) {
						$scope.milestonesForPhases[milestone.phase] = [];
					}

					$scope.milestonesForPhases[milestone.phase].push(milestone);
				});
				$scope.$apply();
			}

			function loadAllMilestones () {
				MilestoneModel.userMilestones($scope.project._id, "read").then(addMilestonesToPhase);
			}
			// Initialize milestone data structure.
			loadAllMilestones();

			function loadMilestonesForPhase (phaseId) {
				MilestoneModel.milestonesForPhase(phaseId)
					.then(function(milestones) {
						if (phaseId in $scope.milestonesForPhases) {
							$scope.milestonesForPhases[phaseId].length = 0;
						}

						addMilestonesToPhase(milestones);
					});
			}

			$scope.completeMilestone = function (milestone) {
				MilestoneModel.completeMilestone(milestone._id)
					.then(function () {
						loadMilestonesForPhase(milestone.phase);
					});
			};
			$scope.startMilestone = function (milestone) {
				MilestoneModel.startMilestone(milestone._id)
					.then(function () {
						loadMilestonesForPhase(milestone.phase);
					});
			};

			$scope.addMilestone = function(phase) {
				$modal.open({
					scope: $scope.$new(),
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/project.schedule.milestone.add.modal.html',
					controller: function ($modalInstance, MilestoneModel, $scope) {
						$scope.options = phaseDropdownOptions(phase);
						$scope.selectedMilestoneType = $scope.options[0];

						$scope.cancel = function () {
							$modalInstance.dismiss("cancel");
						};

						$scope.changeOption = function () {
							if ($scope.selectedMilestoneType.code === 'custom-milestone') {
								$scope.showCustom = true;
							} else {
								$scope.showCustom = false;
							}
						};

						$scope.ok = function(selectedMilestoneType, dateStarted, dateCompleted) {

							// If they add a custom milestone, override the code and name here.
							if (selectedMilestoneType.code === 'custom-milestone') {
								selectedMilestoneType.code = $scope.customMilestoneText;
								selectedMilestoneType.name = $scope.customMilestoneText;
							}
							// TODO: Get a list of default duration for each milestone type (lookup in db)
							// "duration": selectedMilestoneType.duration
							return MilestoneModel.add({
								"code": selectedMilestoneType.code,
								"name": selectedMilestoneType.name,
								"phase": phase._id,
								"dateStartedEst": dateStarted,
								"dateCompletedEst": dateCompleted,
								"project": $scope.project._id,
								"projectCode": $scope.project.code
							})
								.then(function (ms) {
									phase.milestones.push(ms._id);
									return PhaseModel.save(phase);
								})
								.then(function(p) {
									phase.__v = p.__v;
									$modalInstance.close();
								});
						};
					},
				})
					.result
					.then(function (data) {
						loadMilestonesForPhase(phase._id);
					});
			};

			$scope.openEditMilestone = function(milestone) {
				$modal.open({
					scope: $scope.$new(),
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/project.schedule.milestone.edit.modal.html',
					resolve: {
						milestone: function (MilestoneModel) {
							return MilestoneModel.get('/api/milestone/'+milestone._id);
						}
					},
					controller: function ($modalInstance, MilestoneModel, milestone, $scope) {
						$scope.milestone = milestone;

						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						$scope.ok = function () {
							console.log("ok");
							MilestoneModel.save($scope.milestone)
								.then(function (res) {
									$modalInstance.close(res);
								});
						};
					},
				})
					.result
					.then(function () {
						loadMilestonesForPhase(milestone.phase);
					});
			};

			$scope.openDeleteMilestone = function(milestone) {
				$modal.open({
					scope: $scope.$new(),
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/project.schedule.milestone.delete.modal.html',
					controller: function ($modalInstance, MilestoneModel, $rootScope) {
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						};

						$scope.ok = function () {
							// Delete it
							console.log("ok");
							console.log(milestone);

							var phase = _.findWhere($scope.project.phases, { _id: milestone.phase });
							var promise = Promise.resolve(phase);

							if (phase) {
								console.log("found phase");
								var index = phase.milestones.indexOf(milestone._id);
								if (index >= 0) {
									console.log("found milestone");
									phase.milestones.splice(index, 1);

									promise = PhaseModel.save(phase);
								}
							}

							promise
								.then(function(p) {
									phase.__v = p.__v;
									return MilestoneModel.deleteMilestone(milestone._id);
								})
								.then(function (res) {
									$modalInstance.close();
								});
						};
					},
				})
					.result
					.then(function() {
						console.log("reloading milestones for phases");
						return loadMilestonesForPhase(milestone.phase);
					});
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

			$scope.isLastCompletePhase = function (id) {
				var index = _.findLastIndex($scope.project.phases, { status: "Complete" });

				if (index < 0) {
					return false;
				}

				return $scope.project.phases[index]._id === id;
			};

			$scope.startNextPhase = function () {
				ProjectModel.startNextPhase($scope.project)
					.then(function (res) {
						$scope.project = res;
						$scope.$apply();
					});
			};
			
			$scope.addPhase = function(phase) {
				$modal.open({
					scope: $scope.$new(),
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/project.schedule.phase.add.modal.html',
					resolve: {
						options: function(PhaseBaseModel) {
							return PhaseBaseModel.getCollection();
						}
					},
					controller: function ($modalInstance, MilestoneModel, $scope, options) {
						$scope.options = _.filter(options, function(option) {
							return !_.findWhere($scope.project.phases, { code: option.code });
						});

						$scope.selectedPhase = $scope.options[0];

						$scope.cancel = function () {
							$modalInstance.dismiss("cancel");
						};

						$scope.ok = function(selectedPhase) {
							ProjectModel.addPhase($scope.project, selectedPhase.code)
								.then(function(project) {
									$modalInstance.close(project);
								});
						};
					},
				})
					.result
					.then(function (project) {
						$scope.project = project;
					});
			};


			$scope.deletePhase = function(phase) {
				// Remove Phase from project.
				return ProjectModel.removePhase($scope.project, phase)
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

			function phaseDropdownOptions (phase) {
				var options;

				switch(phase.code) {
					case "determination":
						options = [
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
					case "scope":
						options = [
							{
								"name": "Section 11 Order",
								"code": "section-11-order"
							}, {
								"code": 'section-15-order',
								"name": 'Section 15 Order - s.14 variance'
							}, {
								"code": 'section-14-order',
								"name": 'Section 14 Order'
							}, {
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
							}, {
								"code": 'assessment-suspension',
								"name": 'Assessment Suspension - s.30.1',
							}, {
								"code": 'project-termination',
								"name": 'Project Termination - s.24.3',
							}, {
								"code": 'vc-finalized-and-approved',
								"name": 'VC Finalized and Approved',
							}, {
								"code": 'pre-app-pcp-completed',
								"name": 'Pre-App PCP Completed',
							}, {
								"code": 'pre-app-open-house-completed',
								"name": 'Pre-App Open House Completed',
							}, {
								"code": 'draft-vc-ready-for-commenting',
								"name": 'Draft VC Ready for Commenting',
							}, {
								"code": 'working-group-formed',
								"name": 'Working Group Formed',
							}, {
								"code": 'announce-project',
								"name": 'Announce Project',
							}];
						break;
					case "evaluation":
						options = [
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
							}, {
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
					case "review":
						options = [
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
							}, {
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
						options = [
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
							}, {
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
						options = [
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
							}, {
								"code": 'ea-certificate-extension',
								"name": 'EA Certificate Extension',
							}, {
								"code": 'ea-certificate-extension-fee',
								"name": 'EA Certificate Extension Fee',
							}, {
								"code": 'ea-certificate-amendment',
								"name": 'EA Certificate Amendment',
							}, {
								"code": 'ea-certificate-amendment-fee',
								"name": 'EA Certificate Amendment Fee',
							}, {
								"code": 'ea-certificate-amendment-pcp-initiated',
								"name": 'EA Certificate Amendment PCP Initiated',
							}, {
								"code": 'ea-certificate-amendment-open-house-completed',
								"name": 'EA Certificate Amendment Open House Completed',
							}, {
								"code": 'ea-certificate-amendment-pcp-completed',
								"name": 'EA Certificate Amendment PCP Completed',
							}, {
								"code": 'ea-certificate-cancellation-s-37-1',
								"name": 'EA Certificate Cancellation - s.37.1',
							}, {
								"code": 'ea-certificate-expired-s-18-5',
								"name": 'EA Certificate Expired - s.18.5',
							}, {
								"code": 'ea-certificate-suspension-s-37-1',
								"name": 'EA Certificate Suspension - s.37.1',
							}];
						break;
				}
				// Add this to everything except:
				if (phase.code !== 'post-certification') {
					options.push({
						"name": "Project Withdrawn",
						"code": "project-withdrawn"
					});
				}

				var sortedOptions = _.sortBy(options, "name");

				// Always add free-text version, always first (ESM-745)
				return [{ "name": "Custom Milestone", "code": "custom-milestone" }].concat(sortedOptions);
			}
		}
	});
}]);











