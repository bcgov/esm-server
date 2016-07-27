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
controllerProjectEntry.$inject = ['$scope', '$state', '$stateParams', 'project', 'REGIONS', 'PROJECT_TYPES', '_', 'UserModel', 'ProjectModel', 'OrganizationModel', 'Authentication', 'codeFromTitle'];
/* @ngInject */
function controllerProjectEntry ($scope, $state, $stateParams, project, REGIONS, PROJECT_TYPES, _, UserModel, ProjectModel, OrganizationModel, Authentication, codeFromTitle) {

	ProjectModel.setModel ($scope.project);

	if (!$scope.project.proponent || _.isEmpty ($scope.project.proponent)) {
		if (Authentication.user.org) {
			OrganizationModel.getModel (Authentication.user.org)
			.then (function (org) {
				if (org) {
					$scope.project.proponent = org;
				} else {
					OrganizationModel.getNew ().then (function (neworg) {
						$scope.project.proponent = neworg;
					});
				}
			})
			.catch (function (err) {
				console.error ('Error getting organization:');
			});
		} else {
			OrganizationModel.getNew ().then (function (neworg) {
				$scope.project.proponent = neworg;
			});
		}
	} else {
		if (!_.isObject ($scope.project.proponent)) {
			OrganizationModel.getModel ($scope.project.proponent).then (function (org) {
				$scope.project.proponent = org;
			});
		}
	}
	if (!$scope.project.primaryContact || _.isEmpty ($scope.project.primaryContact)) {
		// UserModel.getModel (Authentication.user._id)
		UserModel.me (Authentication.user._id)
		.then (function (userrecord) {
			if (userrecord) {
				$scope.project.primaryContact = userrecord;
			} else {
				UserModel.getNew ().then (function (newuser) {
					$scope.project.primaryContact = newuser;
				});
			}
		})
		.catch (function (err) {
			console.error ('Error getting user record:');
		});
	} else {
		if (!_.isObject ($scope.project.primaryContact)) {
			UserModel.me ($scope.project.primaryContact)
			.then (function (userrecord) {
				$scope.project.primaryContact = userrecord;
			});
		}
	}


	if ($stateParams.projectid === 'new') {
		ProjectModel.modelIsNew = true;
	}

	$scope.project = project;
	$scope.questions = ProjectModel.getProjectIntakeQuestions();
	$scope.regions = REGIONS;
	$scope.types = PROJECT_TYPES;
	$scope._ = _;





	$scope.saveProject = function(isValid) {
		if (!isValid) {
			$scope.$broadcast('show-errors-check-validity', 'projectForm');
			return false;
		}

		// UserModel.saveModel ()
		Promise.resolve (Authentication.user)
		.then (function (um) {
			$scope.project.primaryContact = um._id;
			return OrganizationModel.saveModel ();
		})
		.then (function (om) {
			$scope.project.proponent = om._id;
			return ProjectModel.saveModel ();
		})
		// ProjectModel.saveModel ()
		.then( function(data) {
			//$state.go('p.detail', {projectid: data.code});
		})
		.catch (function (err) {
			console.error ('error = ', err);
		});
	};

	$scope.onChangeProjectName = function () {
		// Calculate the new shortname
		project.shortName = codeFromTitle(project.name);
	};

	// Submit the project for stream assignment.
	$scope.submitProject = function(isValid) {
		if (!isValid) {
			$scope.$broadcast('show-errors-check-validity', 'projectForm');
			return false;
		}

		ProjectModel.submit ()
		.then (function (data) {
	  		$scope.project = _.extend($scope.project, data);
			$state.go('p.detail', {projectid: $scope.project.code});
		})
		.then (function () {
			Promise.resolve (Authentication.user)
			.then (function (um) {
				$scope.project.primaryContact = um._id;
				return OrganizationModel.saveModel ();
			});
			// This really needs to change to do the new flow of proponent intake.
			// .then (function (om) {
			// 	$scope.project.proponent = om._id;
			// 	return ProjectModel.save();
			// });
		})
		.catch (function (err) {
			console.error ('error = ', err);
		});
	};
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
	$scope.selectedPhaseId = $cookies.phase;
	$scope.selectedMilestoneId = $cookies.milestone;

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

			if ($cookies.phase !== phase._id) {
				$cookies.phase = phase._id;
				// the phase has changed, reset the structures down the chain.
				$cookies.milestone = undefined;
				$cookies.activity = undefined;
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
			if ($cookies.milestone !== milestone._id) {
				$cookies.milestone = milestone._id;
				$cookies.activity = undefined;
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
			if ($cookies.Activity !== activity._id) {
				$cookies.activity = activity._id;
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
