'use strict';

angular.module('project')
	// General
	.controller('controllerModalProjectSchedule', controllerModalProjectSchedule)

	.controller('controllerProjectVC', controllerProjectVC)
	.controller('controllerProjectVCEntry', controllerProjectVCEntry)

	.controller('controllerProjectEntry', controllerProjectEntry)
	.controller('controllerModalProjectImport', controllerModalProjectImport)

	.controller('controllerProjectActivities', controllerProjectActivities);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectSchedule.$inject = ['$modalInstance', 'PhaseModel', '_', 'rProject'];
/* @ngInject */
function controllerModalProjectSchedule($modalInstance,  PhaseModel, _, rProject) {
	var projSched = this;

	var savedOriginal = angular.copy(rProject.phases);
	projSched.phases = rProject.phases;

	projSched.cancel = function () { $modalInstance.dismiss('cancel'); };
	projSched.ok = function () {
		// save each phase.
		_.each(projSched.phases, function(item) {
			PhaseModel.setModel(item);
			PhaseModel.saveModel().then( function(res) {
				// console.log('saved');
			}).catch( function(err) {
				$modalInstance.dismiss('cancel');
			});
		});
		$modalInstance.close();
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project VC
//
// -----------------------------------------------------------------------------------
controllerProjectVC.$inject = ['$scope', 'rProjectVC', '_', '$modalInstance', 'VCModel'];
/* @ngInject */
function controllerProjectVC($scope, rProjectVC, _, $modalInstance, sVCModel) {
		var projectVC = this;

		projectVC.roles = ['admin', 'project-team', 'working-group', 'first-nations', 'consultant'];
		projectVC.vc = rProjectVC;

		// Set current model for VC
		sVCModel.setModel(rProjectVC);

		sVCModel.getCollection().then(function(data){
				projectVC.valuecomponents = data;
		});

		// on save, pass complete permission structure to the server
		projectVC.ok = function () {
				$modalInstance.close();
		};
		projectVC.cancel = function () { $modalInstance.dismiss('cancel'); };

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project VC Entry
//
// -----------------------------------------------------------------------------------
controllerProjectVCEntry.$inject = ['rProjectVCEntry', '_', '$modalInstance'];
/* @ngInject */
function controllerProjectVCEntry(rProjectVCEntry, _, $modalInstance) {
	var projectVCEntryModal = this;

	projectVCEntryModal.roles = ['admin', 'project-team', 'working-group', 'first-nations', 'consultant'];

	projectVCEntryModal.response = "response";
	projectVCEntryModal.comments = "comments";

	// on save, pass complete permission structure to the server
	projectVCEntryModal.ok = function () {
		$modalInstance.close();
	};
	projectVCEntryModal.cancel = function () { $modalInstance.dismiss('cancel'); };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Entry Tombstone
//
// -----------------------------------------------------------------------------------
controllerModalProjectImport.$inject = ['Upload', '$modalInstance', '$timeout', '$scope', '$state', 'Project',  'ProjectModel', 'rProject', 'REGIONS', 'PROJECT_TYPES', '_', 'ENV'];
/* @ngInject */
function controllerModalProjectImport(Upload, $modalInstance, $timeout, $scope, $state, sProject, ProjectModel, rProject, REGIONS, PROJECT_TYPES, _, ENV) {
	var projectImport = this;
	$scope.environment = ENV;

	// Setup default endpoint for import option
	if (ENV === 'MEM') {
		$scope.defaultOption = '/api/projects/import/mem';
	} else {
		$scope.defaultOption = '/api/projects/import/eao';
	}

	projectImport.fileList = [];

	$scope.$watch('files', function (newValue) {
		if (newValue) {
			projectImport.inProgress = false;
			_.each( newValue, function(file, idx) {
				projectImport.fileList.push(file);
			});
		}
	});

	$scope.$on('importUploadComplete', function() {
		$modalInstance.close();
	});

	$scope.$on('importUploadStart', function(event) {
		projectImport.upload();
		$modalInstance.dismiss();
	});

	projectImport.ok = function () {
		$scope.$broadcast('importUploadStart', false);
	};

	projectImport.removeFile = function(f) {
		_.remove(projectImport.fileList, f);
	};

	projectImport.cancel = function () {
		$modalInstance.dismiss();
	};

	// Standard save make sure documents are uploaded before save.
	projectImport.upload = function() {
		// console.log("Got file:",projectImport.fileList);
		var docCount = projectImport.fileList.length;
		projectImport.fileList.forEach(function (item) {
			// Check file type
			var upload = Upload.upload({
				url: item.importType,
				file: item
			});

			upload.then(function (response) {
				$timeout(function () {
					//console.log('filedata', response.data);
					// // when the last file is finished, send complete event.
					if (--docCount === 0) {
						// emit to parent.
						$scope.$emit('importUploadComplete');
					}
					// console.log("we're done with ",response);
					item.processingComplete = true;
				});
			}, function (response) {
				// if (response.status > 0) {
				// 	projectImport.errorMsg = response.status + ': ' + response.data;
				// } else {
				// 	_.remove($scope.files, file);
				// }
			}, function (evt) {
				item.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
		});
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Entry Tombstone
// Used.
//
// -----------------------------------------------------------------------------------
controllerProjectEntry.$inject = ['$scope', '$state', '$stateParams', '$modal', 'project', 'REGIONS', 'PROJECT_TYPES',
	'PROJECT_SUB_TYPES', 'CEAA_TYPES', 'EAC_DECISIONS', '_', 'UserModel', 'ProjectModel', 'OrganizationModel',
	'Authentication', 'codeFromTitle', 'EAO_COMPLIANCE_EMAIL'];
/* @ngInject */
function controllerProjectEntry ($scope, $state, $stateParams, $modal, project, REGIONS, PROJECT_TYPES,
	PROJECT_SUB_TYPES, CEAA_TYPES, EAC_DECISIONS, _, UserModel, ProjectModel, OrganizationModel,
	Authentication, codeFromTitle, EAO_COMPLIANCE_EMAIL) {

	ProjectModel.setModel ($scope.project);

	if ($scope.project.proponent && !_.isObject ($scope.project.proponent)) {
		OrganizationModel.getModel ($scope.project.proponent).then (function (org) {
			$scope.project.proponent = org;
		});
	}
	if ($scope.project.primaryContact && !_.isObject ($scope.project.primaryContact)) {
		UserModel.me ($scope.project.primaryContact)
		.then (function (userrecord) {
			$scope.project.primaryContact = userrecord;
		})
		.catch (function (err) {
			console.error ('Error getting user record:');
		});
	}

	if ($stateParams.projectid === 'new') {
		ProjectModel.modelIsNew = true;
	}

	$scope.project = project;
	$scope.questions = ProjectModel.getProjectIntakeQuestions();
	$scope.regions = REGIONS;
	$scope.types = PROJECT_TYPES;
	$scope.subTypes = PROJECT_SUB_TYPES;
	$scope._ = _;
	$scope.CEAA = CEAA_TYPES;
	$scope.eacDecisions = [''];// optional, so give a choice to clear it out...
	_.each(EAC_DECISIONS, function(item) {
		$scope.eacDecisions.push(item);
	});

	$scope.saveEPD = function(users) {
		var user = _.isArray(users) ? users[0] : users;
		$scope.project.responsibleEPD = user.displayName;
		$scope.project.responsibleEPDEmail = user.email;
		$scope.project.responsibleEPDPhone = user.phoneNumber;
	};
	$scope.saveProjectLead = function(users) {
		var user = _.isArray(users) ? users[0] : users;
		$scope.project.projectLead = user.displayName;
		$scope.project.projectLeadEmail = user.email;
		$scope.project.projectLeadPhone = user.phoneNumber;
	};
	$scope.saveCELead = function(users) {
		var user = _.isArray(users) ? users[0] : users;
		$scope.project.CELead = user.displayName;
		$scope.project.CELeadEmail = EAO_COMPLIANCE_EMAIL;
		$scope.project.CELeadPhone = user.phoneNumber;
	};

	$scope.saveProject = function(isValid) {
		if (!isValid) {
			$scope.$broadcast('show-errors-check-validity', 'projectForm');
			$scope.$broadcast('show-errors-check-validity', 'detailsForm');
			$scope.$broadcast('show-errors-check-validity', 'contactsForm');
			return false;
		}
		if (ProjectModel.modelIsNew) {
			ProjectModel.add ($scope.project)
			.then( function(data) {
				$state.go('p.detail', {projectid: data.code});
			})
			.catch (function (err) {
				console.error ('error = ', err);
			});
		} else {
			ProjectModel.saveModel($scope.project)
			.then( function(data) {
				$state.go('p.detail', {projectid: data.code});
			})
			.catch (function (err) {
				console.error ('error = ', err);
			});
		}
	};

	$scope.onChangeProjectName = function () {
		// Calculate the new shortname
		project.shortName = codeFromTitle(project.name);
		project.code = codeFromTitle(project.name);
	};

	// Submit the project for stream assignment.
	$scope.submitProject = function(isValid) {
		if (!isValid) {
			$scope.$broadcast('show-errors-check-validity', 'projectForm');
			$scope.$broadcast('show-errors-check-validity', 'proponentForm');
			$scope.$broadcast('show-errors-check-validity', 'detailsForm');
			$scope.$broadcast('show-errors-check-validity', 'contactsForm');
			return false;
		}

		ProjectModel.add ($scope.project)
		.then (function (data) {
			return ProjectModel.submit(data);
		})
		.then( function (p) {
			$scope.project = p;
			$state.go('p.detail', {projectid: p.code});
		})
		.catch (function (err) {
			console.error ('error = ', err);
		});
	};

	$scope.showSuccess = function(msg, transitionCallback, title) {
		var modalDocView = $modal.open({
			animation: true,
			templateUrl: 'modules/utils/client/views/partials/modal-success.html',
			controller: function($scope, $state, $modalInstance, _) {
				var self = this;
				self.title = title || 'Success';
				self.msg = msg;
				self.ok = function() {
					$modalInstance.close($scope.project);
				};
				self.cancel = function() {
					$modalInstance.dismiss('cancel');
				};
			},
			controllerAs: 'self',
			scope: $scope,
			size: 'md',
			windowClass: 'modal-alert',
			backdropClass: 'modal-alert-backdrop'
		});
		// do not care how this modal is closed, just go to the desired location...
		modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
	};

	$scope.showError = function(msg, errorList, transitionCallback, title) {
		var modalDocView = $modal.open({
			animation: true,
			templateUrl: 'modules/utils/client/views/partials/modal-error.html',
			controller: function($scope, $state, $modalInstance, _) {
				var self = this;
				self.title = title || 'An error has occurred';
				self.msg = msg;
				self.ok = function() {
					$modalInstance.close($scope.project);
				};
				self.cancel = function() {
					$modalInstance.dismiss('cancel');
				};
			},
			controllerAs: 'self',
			scope: $scope,
			size: 'md',
			windowClass: 'modal-alert',
			backdropClass: 'modal-alert-backdrop'
		});
		// do not care how this modal is closed, just go to the desired location...
		modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
	};

	var goToList = function() {
		$state.transitionTo('activities', {}, {
			reload: true, inherit: false, notify: true
		});
	};

	var reloadEdit = function() {
		$state.reload();
	};

	$scope.deleteProject = function() {
		var modalDocView = $modal.open({
			animation: true,
			templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
			controller: function($scope, $state, $modalInstance, _) {
				var self = this;
				self.dialogTitle = "Delete Project";
				self.name = $scope.project.name;
				self.ok = function() {
					$modalInstance.close($scope.project);
				};
				self.cancel = function() {
					$modalInstance.dismiss('cancel');
				};
			},
			controllerAs: 'self',
			scope: $scope,
			size: 'md'
		});
		modalDocView.result.then(function (res) {
			ProjectModel.removeProject($scope.project)
				.then(function (res) {
					// deleted show the message, and go to list...
					$scope.showSuccess('"'+ $scope.project.name +'"' + ' was deleted successfully.', goToList, 'Delete Success');
				})
				.catch(function (res) {
					console.log("res:", res);
					// could have errors from a delete check...
					var failure = _.has(res, 'message') ? res.message : undefined;
					$scope.showError('"'+ $scope.project.name +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
				});
		}, function () {
			//console.log('delete modalDocView error');
		});	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Timeline
//
// -----------------------------------------------------------------------------------
// controllerProjectProponent.$inject = ['$scope', 'PROVINCES'];
// /* @ngInject */
// function controllerProjectProponent($scope, PROVINCES) {
// 	var projectProponent = this;

// 	projectProponent.provs = PROVINCES;

// 	$scope.$watch('project', function(newValue) {
// 		projectProponent.project = newValue;
// 	});
// }

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Activities
//
// -----------------------------------------------------------------------------------
controllerProjectActivities.$inject = [
	'$scope',
	'$rootScope',
	'sActivity',
	'_',
	'ProjectModel',
	'PhaseModel',
	'PhaseBaseModel',
	'MilestoneBaseModel',
	'MilestoneModel',
	'ActivityModel',
	'ActivityBaseModel',
	'$cookies'];

/* @ngInject */
function controllerProjectActivities(
	$scope,
	$rootScope,
	sActivity,
	_,
	ProjectModel,
	PhaseModel,
	PhaseBaseModel,
	MilestoneBaseModel,
	MilestoneModel,
	ActivityModel,
	ActivityBaseModel,
	$cookies
	) {

	// get any cookie values and preselect the phase and milestone.
	$scope.selectedPhaseId = $cookies.get('phase');
	$scope.selectedMilestoneId = $cookies.get('milestone');

	// Set the project to current model, just in case it already wasn't.
	ProjectModel.setModel($scope.project);
	// -----------------------------------------------------------------------------------
	//
	// Add Phase
	//
	// -----------------------------------------------------------------------------------
	PhaseBaseModel.getCollection().then( function(data) {
		$scope.allPhases = data;
	});

	$scope.addNewPhase = function() {
		if($scope.newBasePhase) {
			ProjectModel.addPhase($scope.newBasePhase.code).then( function(data) {
				$scope.project.phases = angular.copy(data.phases);
				$scope.showNewPhase = false;
				$scope.$apply();
			});
		}
	};

	$scope.selectPhase = function(phase) {
		if (phase) {
			PhaseModel.setModel(phase);
			$scope.selectedPhase = phase;

			if ($cookies.get('phase') !== phase._id) {
				$cookies.put('phase', phase._id);
				// the phase has changed, reset the structures down the chain.
				$cookies.put('milestone', undefined);
				$cookies.put('activity', undefined);
				$scope.milestones = phase.milestones;
				$scope.activities = undefined;
				$scope.selectedMilestone = undefined;
			}
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Add Milestone
	//
	// -----------------------------------------------------------------------------------
	MilestoneBaseModel.getCollection().then( function(data) {
		$scope.allMilestones = data;
	});

	$scope.addNewMilestone = function() {
		if($scope.newBaseMilestone) {
			PhaseModel.addMilestone($scope.newBaseMilestone.code).then( function(data) {
				$scope.selectedPhase.milestones = angular.copy(data.milestones);
				$scope.showNewMilestone = false;
			});
		}
	};

	$scope.selectMilestone = function(milestone) {
		if (milestone) {
			MilestoneModel.setModel(milestone);
			$scope.selectedMilestone = milestone;
			if ($cookies.get('milestone') !== milestone._id) {
				$cookies.put('milestone', milestone._id);
				$cookies.put('activity', undefined);
				// the phase has changed, reset the structures down the chain.
				$scope.activities = milestone.activities;
				$scope.selectedActivity = undefined;
			}
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Add Activity
	//
	// -----------------------------------------------------------------------------------
	ActivityBaseModel.getCollection().then( function(data) {
		$scope.allActivities = data;
	});

	$scope.addNewActivity = function() {
		if($scope.newBaseActivity) {
			MilestoneModel.addActivity($scope.newBaseActivity.code).then( function(data) {
				$scope.selectedMilestone.activities = angular.copy(data.activities);
				$scope.showNewActivity = false;
				$scope.$apply();
			});
		}
	};

	$scope.selectActivity = function(activity) {
		if (activity) {
			ActivityModel.setModel(activity);
			$scope.selectedActivity = activity;
			if ($cookies.get('activity') !== activity._id) {
				$cookies.put('activity', undefined);
			}
		}
	};
	// var unbind = $rootScope.$on('refreshActivitiesForMilestone', function(event, data) {
	// 	// console.log(data.milestone);
	// 	$scope.selectMilestone(data.milestone);
	// });
	// $scope.$on('$destroy',unbind);


	// wait until the list of phases loads.
	// if one is set in the cookie, select it.
	// this is triggered from the project load below.
	// $scope.$watch(function () {
	// 	return $scope.project.phases;
	// },function(newValue){
	// 	// if there is a preset, find and select it.
	// 	if ($scope.selectedPhaseId && newValue) {
	// 		_.each( newValue, function(phase) {
	// 			if (phase._id === $scope.selectedPhaseId) {
	// 				$scope.selectPhase( phase );
	// 			}
	// 		});
	// 	}
	// });


	// // select a milestone if there is one.
	// $scope.$watch(function () {
	// 	return $scope.milestones;
	// },function(newValue){
	// 	// console.log('mile', newValue);
	// 	// if there is a preset, select it.
	// 	if ($scope.selectedMilestoneId && newValue) {
	// 		_.each( newValue, function(milestone) {
	// 			if (milestone._id === $scope.selectedMilestoneId) {
	// 				$scope.selectMilestone( milestone );
	// 			}
	// 		});
	// 	}

	// });

}
