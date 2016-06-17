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
		controller: function ($scope, $stateParams, project, ENV, $rootScope, ProjectModel, Menus, MenuControl) {
			$scope.project = project;
			$scope.environment = ENV;
			$scope.isNew = ($stateParams.projectid === 'new');

			ProjectModel.setModel(project);

			$scope.intakeQuestions = ProjectModel.getProjectIntakeQuestions();

			// //
			// // Clear out the project side menu... and add them on the fly
			// // we need the project context to properly show the menus, or else we get 403 on the routes...
			// //
			// Menus.removeMenuItem('projectTopMenu', 'p.edit');
			// Menus.removeMenuItem('projectTopMenu', 'p.schedule');
			// Menus.removeMenuItem('projectTopMenu', 'p.comments');
			// Menus.removeMenuItem('projectTopMenu', 'p.enforcements');
			// Menus.removeMenuItem('projectMenu', 'p.documents');
			// Menus.removeMenuItem('projectMenu', 'p.invitations');
			// Menus.removeMenuItem('projectMenu', 'p.commentperiod.list');
			// Menus.removeMenuItem('projectMenu', 'p.complaint.list');
			// Menus.removeMenuItem('projectMenu', 'p.projectcondition.list');
			// Menus.removeMenuItem('projectMenu', 'p.ir.list');
			// Menus.removeMenuItem('projectMenu', 'p.roles.list');
			// Menus.removeMenuItem('projectMenu', 'p.vc.list');

			// Menus.addMenuItem('projectTopMenu', {
			// 	title: 'Edit Project',
			// 	state: 'p.edit',
			// 	roles: MenuControl.menuRolesBuilder (undefined, project.code, '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'pro:admin', 'pro:member'])
			// });

			// // Specific to EAO.
			// if (ENV === 'EAO') {
			// 	Menus.addMenuItem('projectTopMenu', {
			// 		title: 'Schedule',
			// 		state: "p.schedule",
			// 		roles: MenuControl.menuRolesBuilder (undefined, project.code, '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'minister-office', 'qa-officer', 'ce-lead', 'ce-officer', 'wg', 'ceaa', 'pro:admin', 'pro:member', 'sub'])
			// 	});
			// 	Menus.addMenuItem('projectTopMenu', {
			// 		title: 'Compliance Oversight',
			// 		state: "p.enforcements",
			// 		roles: MenuControl.menuRolesBuilder (['user'], project.code, '*', '*')
			// 	});
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Comment Periods',
			// 		state: "p.commentperiod.list",
			// 		roles: ['admin','user','public'] //MenuControl.menuRolesBuilder (['admin','user','public'], project.code, '*', '*')
			// 	});
			// }

			// Menus.addMenuItem('projectMenu', {
			// 	title: 'Documents',
			// 	state: 'p.documents',
			// 	roles:  MenuControl.menuRolesBuilder (['admin','user','public'], project.code, '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'pro:admin', 'pro:member', 'sub'])
			// });
			// if (ENV === 'EAO') {
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Project Invitations',
			// 		state: 'p.invitations',
			// 		roles: MenuControl.menuRolesBuilder (undefined, project.code, '*', ['eao:admin', 'responsible-epd','project-admin', 'project-lead','project-intake', 'pro:admin', 'pro:member'])
			// 	});
			// 	// Menus.addMenuItem('projectMenu', {
			// 	// 	title: 'Comment Periods',
			// 	// 	state: 'p.commentperiod.list',
			// 	// 	roles: MenuControl.menuRoles ('admin', project.code, '*', '*')
			// 	// });
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Complaints',
			// 		state: 'p.complaint.list',
			// 		roles: MenuControl.menuRolesBuilder (undefined, project.code, '*', ['ce-lead', 'ce-officer'])
			// 	});
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Conditions',
			// 		state: 'p.projectcondition.list',
			// 		roles: MenuControl.menuRolesBuilder ([undefined], project.code, 'eao', ['admin',
			// 																			'member',
			// 																			'assistant-dm',
			// 																			'assistant-dmo',
			// 																			'associate-dm',
			// 																			'associate-dmo',
			// 																			'minister',
			// 																			'ministers-office',
			// 																			'responsible-epd',
			// 																			'project-admin',
			// 																			'project-lead',
			// 																			'project-team',
			// 																			'qa-officer',
			// 																			'ce-lead',
			// 																			'ce-officer'])
			// 	});
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Inspection Reports',
			// 		state: 'p.ir.list',
			// 		roles: MenuControl.menuRolesBuilder (undefined, project.code, '*', ['ce-lead', 'ce-officer'])
			// 	});
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Project Roles',
			// 		state: 'p.roles.list',
			// 		roles: MenuControl.menuRolesBuilder (['admin'], project.code, '*', ['project-lead', 'project-intake', 'pro:admin', 'pro:member', 'sub'])
			// 	});
			// 	Menus.addMenuItem('projectMenu', {
			// 		title: 'Valued Components',
			// 		state: 'p.vc.list',
			// 		roles: MenuControl.menuRolesBuilder (undefined, project.code, '*', ['eao:admin', 'eao:member', 'responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'pro:admin', 'pro:member', 'sub'])
			// 	});
			// }

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
		context: 'projectid',
		templateUrl: 'modules/projects/client/views/project-partials/project.detail.html',
		controller: function ($scope, $state, project, ProjectModel, $window) {
			$scope.project = project;

			// complete the current phase.
			$scope.completePhase = function() {
				ProjectModel.completePhase( project ).then( function(res) {
					$scope.project = res;
					$scope.$apply ();
					$state.go($state.current, {}, {reload: true});
					// $window.location.reload();
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};

			// complete the current phase.
			$scope.startNextPhase = function() {
				ProjectModel.nextPhase( project ).then( function(res) {
					$scope.project = res;
					$scope.$apply ();
					$state.go($state.current, {}, {reload: true});
					// $window.location.reload();
					// $state.transitionTo('p.detail', {projectid:project.code}, {
			  // 			reload: true, inherit: false, notify: true
					// });
				});
			};

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
		// resolve: {
		// 	intakeQuestions: function(ProjectModel) {
		// 		return ProjectModel.getProjectIntakeQuestions();
		// 	}
		// },
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccessBuilder(undefined, '*', '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'pro:admin', 'pro:member']);
			}
			else {
				MenuControl.routeAccessBuilder(undefined, project.code, '*', ['responsible-epd','project-admin', 'project-lead','project-team','project-intake', 'assistant-dm', 'associate-dm', 'qa-officer', 'ce-lead', 'ce-officer', 'pro:admin', 'pro:member']);
			}
		}
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
		// resolve: {
		// 	intakeQuestions: function(ProjectModel) {
		// 		return ProjectModel.getProjectIntakeQuestions();
		// 	}
		// },
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccessBuilder (undefined, '*', '*', ['ce-lead', 'ce-officer']);
			}
			else {
				MenuControl.routeAccessBuilder (['admin', 'user', 'public']);
			}
		}
	})

	// -------------------------------------------------------------------------
	//
	// PUBLIC COMMENT PERIOD
	//
	// -------------------------------------------------------------------------
	.state('p.comments', {
		url: '/public-comment-period',
		templateUrl: 'modules/publicComments/client/views/comments-public.html',
		controller: 'controllerProjectEntry',
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccessBuilder (undefined, '*', '*', ['ce-lead', 'ce-officer']);
			}
			else {
				MenuControl.routeAccessBuilder (['admin', 'user', 'public']);
			}
		}
	})
	.state('p.eaocomments', {
		url: '/eao-comment-period',
		templateUrl: 'modules/publicComments/client/views/comments-eao.html',
		controller: 'controllerProjectEntry',
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccessBuilder (undefined, '*', '*', ['ce-lead', 'ce-officer']);
			}
			else {
				MenuControl.routeAccessBuilder (['admin', 'user', 'public']);
			}
		}
	})
	.state('p.proponentcomments', {
		url: '/proponent-comment-period',
		templateUrl: 'modules/publicComments/client/views/comments-proponent.html',
		controller: 'controllerProjectEntry',
		onEnter: function (MenuControl, project, $stateParams) {
			if ($stateParams.projectid === 'new') {
				MenuControl.routeAccessBuilder (undefined, '*', '*', ['ce-lead', 'ce-officer']);
			}
			else {
				MenuControl.routeAccessBuilder (['admin', 'user', 'public']);
			}
		}
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
			self.rPhases = undefined;
			self.rSelPhase = undefined;
			self.rMilestonesForPhase = undefined;

			$scope.openDeleteMilestone = function(id) {
					var modalDocView = $modal.open({
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
			self.refresh = function () {
				// console.log("Refreshing");
				PhaseModel.phasesForProject(project._id).then(function (res) {
					// console.log("New set of phase data:",res);
					$scope.rPhases = res;
					$scope.$apply();
				});
			};
			$scope.$watch('project', function(newValue) {
				// console.log("watching project:",newValue);
				self.project = newValue;
				self.refresh();
			});

			$scope.isNextPhase = function (id) {
				var index = -1;
				_.each(self.project.phases, function(data, idx) {
				   if (_.isEqual(data._id, self.project.currentPhase._id)) {
				      index = idx;
				      return;
				   }
				});
				// Double check if this is the last phase for errors
				if (index+1 >= self.project.phases.length)
					return false;
				if (self.project.phases[index+1]._id === id)
					return true;
			};

			$scope.startNextPhase = function (project) {
				ProjectModel.nextPhase(self.project)
				.then( function (res) {
					$scope.project = res;
					$scope.$apply();
					$rootScope.$broadcast('refreshPhases', res);
				});
			};

			$scope.canCompletePhase = function (phase) {
				if (phase.code === $scope.project.currentPhase.code && !$scope.project.currentPhase.completed) {
					return true;
				} else {
					return false;
				}
			};

			$scope.addNextPhase = function () {
				// Find out the current phase, add the one after that.
				PhaseBaseModel.getCollection().then( function(data) {
					var nextPhase = data[$scope.project.phases.length];
					ProjectModel.addPhase(nextPhase.code).then( function(data) {
						$scope.project.phases = angular.copy(data.phases);
						$rootScope.$broadcast('refreshPhases', $scope.project.phases);
						$scope.$apply();
					});
				});
			};

			$scope.completeCurrentPhase = function (project) {
				// Complete this particular phase
				ProjectModel.completePhase(self.project)
				.then( function (res) {
					$scope.project = res;
					$scope.$apply ();
					$rootScope.$broadcast('refreshPhases', res);
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
								"name": "Draft Project Description Accepted",
								"code": "draft-project-description-accepted"
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

			// User clicked on edit phase - store this.
			$scope.selectPhaseForEdit = function (phase) {
				$scope.selectedPhase = phase;
			};

			// Edit the phase data
			$scope.savePhaseDetail = function () {
				PhaseModel.save($scope.selectedPhase)
				.then( function (obj) {
					$rootScope.$broadcast('refreshPhases', obj);
				});
			};

			// Handle the add milestone
			$scope.addMilestone = function(selectedMilestone, dateStarted, dateCompleted) {
				// Just add a milestone, attach it to a specific phase - this is a generic
				// schedule, which really doesn't follow the flow of anything.  It's just a
				// Marker of sorts.  We will need to look this up when phases/milestones progress
				// through the flow of the business in order to delete/reset these milestones.
				// For now, this becomes a 'look ahead' schedule that staff can use to view
				// the project 'plan'

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
					"dateCompletedEst": dateCompleted
				})
				.then(function (ms) {
					$scope.rSelPhase.milestone = ms;
					$scope.rSelPhase.milestones.push(ms);
					PhaseModel.save($scope.rSelPhase)
					.then( function (newPhase) {
						// console.log("newphase:", newPhase);
						$rootScope.$broadcast('refreshPhases', newPhase);
					});
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
			var unbind = $rootScope.$on('refreshPhases', function() {
				self.refresh();
			});
			$scope.$on('$destroy', unbind);
		}
	})
	;
}]);











