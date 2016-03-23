'use strict';

angular.module('project')
	// General
	.controller('controllerProject', controllerProject)
	.controller('controllerModalProjectSchedule', controllerModalProjectSchedule)
	.controller('controllerModalAddPhase', controllerModalAddPhase)
	.controller('controllerModalAddActivity', controllerModalAddActivity)
	.controller('controllerProjectVC', controllerProjectVC)
	.controller('controllerProjectVCEntry', controllerProjectVCEntry)
	.controller('controllerProjectTombstone', controllerProjectTombstone)
	// .controller('controllerProjectTimeline', controllerProjectTimeline)
	.controller('controllerProjectEntry', controllerProjectEntry)
	.controller('controllerModalProjectImport', controllerModalProjectImport)
	// .controller('controllerProjectProponent', controllerProjectProponent)
	// .controller('controllerProjectBucketListing', controllerProjectBucketListing)
	// .controller('controllerProjectResearch', controllerProjectResearch)

	// .controller('controllerProjectNew', controllerProjectNew)
	// .controller('controllerProjectEdit', controllerProjectEdit)
	.controller('controllerProjectStreamSelect', controllerProjectStreamSelect)
	.controller('controllerProjectInitiated', controllerProjectInitiated)
	.controller('controllerProjectActivities', controllerProjectActivities);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Project Detail
//
// -----------------------------------------------------------------------------------
controllerProject.$inject = ['$scope', '$rootScope', 'ProjectModel', '$stateParams', '_'];
/* @ngInject */
function controllerProject($scope, $rootScope, sProjectModel, $stateParams, _) {
	var proj = this;

	proj.refresh = function() {
		sProjectModel.getModel($stateParams.id).then( function(data) {
			console.log (data);
			proj.project = data;
			$scope.$apply();
		}).catch( function(err) {
			console.log (err);
			$scope.error = err;
		});
	};

	var unbind = $rootScope.$on('refreshProject', function() {
		proj.refresh();
	});
	$scope.$on('$destroy', unbind);

	proj.refresh();

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectSchedule.$inject = ['$modalInstance', 'ProjectModel', 'PhaseModel', '_', 'rProject'];
/* @ngInject */
function controllerModalProjectSchedule($modalInstance, sProjectModel, sPhaseModel, _, rProject) {
	var projSched = this;

	sProjectModel.setModel(rProject);
	projSched.project = sProjectModel.getCopy();

	sPhaseModel.phasesForProject(projSched.project._id).then( function(data) {
		projSched.phases = data;
	});

	projSched.cancel = function () { $modalInstance.dismiss('cancel'); };
	projSched.ok = function () {

		console.log(projSched.newPhase);

		if (projSched.newPhase) {
			console.log('setphase');
			sProjectModel.setPhase( projSched.newPhase._id ).then( function(data) {
				$modalInstance.close(data);
				console.log('closed');

			}).catch( function(err) {
				$modalInstance.dismiss('cancel');
			});
		} else {
			$modalInstance.close();
		}
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Add Activity
//
// -----------------------------------------------------------------------------------
controllerModalAddPhase.$inject = ['$modalInstance', 'PhaseBaseModel', '_', 'ProjectModel'];
/* @ngInject */
function controllerModalAddPhase($modalInstance, sPhaseBaseModel, _, sProjectModel) {
	var addPhase = this;

	// get all possible base activities
	sPhaseBaseModel.getCollection().then( function(data) {
		addPhase.phases = data;
	});

	addPhase.cancel = function () { $modalInstance.dismiss('cancel'); };
	addPhase.ok = function () {
		if (addPhase.newBasePhase) {
			// add the new activity to the base model.
			sProjectModel.addPhase(addPhase.newBasePhase._id).then( function(data) {
				$modalInstance.close(data);
			});
		} else {
			$modalInstance.close();
		}
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Add Milestone
//
// -----------------------------------------------------------------------------------
controllerModalAddMilestone.$inject = ['$modalInstance', 'PhaseModel', 'MilestoneBaseModel', '_', 'rPhase'];
/* @ngInject */
function controllerModalAddMilestone($modalInstance, sPhaseModel, sMilestoneBaseModel,  _, rPhase) {
	var addMile = this;

	addMile.milestone = rPhase;

	// set current (actual) milestone context
	sPhaseModel.setModel(rPhase);

	// get all possible base activities
	sMilestoneBaseModel.getCollection().then( function(data) {
		addMile.milestones = data;
	});

	addMile.cancel = function () { $modalInstance.dismiss('cancel'); };
	addMile.ok = function () {
		if (addMile.newBaseMilestone) {
			// add the new activity to the base model.
			sPhaseModel.addMilestone(addMile.newBaseMilestone._id).then( function(data) {
				$modalInstance.close(data);
			});
		} else {
			$modalInstance.close();
		}
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Add Activity
//
// -----------------------------------------------------------------------------------
controllerModalAddActivity.$inject = ['$modalInstance', 'MilestoneModel', 'ActivityBaseModel', '_', 'rMilestone'];
/* @ngInject */
function controllerModalAddActivity($modalInstance, sMilestoneModel, sActivityBaseModel,  _, rMilestone) {
	var addAct = this;

	addAct.milestone = rMilestone;

	// set current (actual) milestone context
	sMilestoneModel.setModel(rMilestone);

	// get all possible base activities
	sActivityBaseModel.getCollection().then( function(data) {
		addAct.activities = data;
	});

	addAct.cancel = function () { $modalInstance.dismiss('cancel'); };
	addAct.ok = function () {
		if (addAct.newBaseActivity) {
			// add the new activity to the base model.
			sMilestoneModel.addActivity(addAct.newBaseActivity._id).then( function(data) {
				$modalInstance.close(data);
			});
		} else {
			$modalInstance.close();
		}
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
// CONTROLLER: Project Tombstone
//
// -----------------------------------------------------------------------------------
controllerProjectTombstone.$inject = ['$scope', 'ProjectModel'];
/* @ngInject */
function controllerProjectTombstone($scope, ProjectModel) {
	var projTomb = this;


	$scope.$watch('project', function (newValue) {
		if (newValue) projTomb.project = newValue;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Timeline
//
// -----------------------------------------------------------------------------------
// controllerProjectTimeline.$inject = ['$scope'];
// /* @ngInject */
// function controllerProjectTimeline($scope) {
// 	var ptime = this;

// 	$scope.$watch('project', function(newValue) {
// 		ptime.project = newValue;
// 	});
// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Entry Tombstone
//
// -----------------------------------------------------------------------------------
controllerModalProjectImport.$inject = ['Upload', '$modalInstance', '$timeout', '$scope', '$state', 'Project',  'ProjectModel', 'rProject', 'REGIONS', 'PROJECT_TYPES', '_', 'ENV'];
/* @ngInject */
function controllerModalProjectImport(Upload, $modalInstance, $timeout, $scope, $state, sProject, sProjectModel, rProject, REGIONS, PROJECT_TYPES, _, ENV) {
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
		console.log("Got file:",projectImport.fileList);
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
					console.log("we're done with ",response);
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
//
// -----------------------------------------------------------------------------------
controllerProjectEntry.$inject = ['$scope', '$state', '$stateParams', 'project', 'REGIONS', 'PROJECT_TYPES', '_', 'intakeQuestions', 'UserModel', 'ProjectModel', 'OrganizationModel', 'Authentication'];
/* @ngInject */
function controllerProjectEntry ($scope, $state, $stateParams, project, REGIONS, PROJECT_TYPES, _, intakeQuestions, UserModel, ProjectModel, OrganizationModel, Authentication) {

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
				console.error ('Error getting organization:', err.data.message);
			});
		} else {
			OrganizationModel.getNew ().then (function (neworg) {
				$scope.project.proponent = neworg;
			});
		}
	} else {
		OrganizationModel.getModel ($scope.project.proponent).then (function (org) {
			$scope.project.proponent = org;
		});
	}
	if (!$scope.project.primaryContact || _.isEmpty ($scope.project.primaryContact)) {
		UserModel.getModel (Authentication.user._id)
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
			console.error ('Error getting user record:', err.data.message);
		});
	} else {
		UserModel.getModel ($scope.project.primaryContact)
		.then (function (userrecord) {
			$scope.project.primaryContact = userrecord;
		});
	}


	if ($stateParams.projectid === 'new') {
		ProjectModel.modelIsNew = true;
	}

	$scope.project = project;
	$scope.questions = intakeQuestions;
	$scope.regions = REGIONS;
	$scope.types = PROJECT_TYPES;
	$scope._ = _;





	$scope.saveProject = function() {
		UserModel.saveModel ()
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
			$state.go('p.detail', {projectid: data.code});
		})
		.catch (function (err) {
			console.error ('error = ', err, 'message = ', err.data.message);
		});
	};

	// Submit the project for stream assignment.
	$scope.submitProject = function() {
		UserModel.saveModel ()
		.then (function (um) {
			$scope.project.primaryContact = um._id;
			return OrganizationModel.saveModel ();
		})
		.then (function (om) {
			$scope.project.proponent = om._id;
			return ProjectModel.submit ();
		})
		// ProjectModel.submit ()
		.then (function (data) {
			$state.transitionTo('p.detail', {projectid: data.code}, {
	  			reload: true, inherit: false, notify: true
	  		});
			// $state.go('p.detail', {projectid: data.code});
		})
		.catch (function (err) {
			console.error ('error = ', err, 'message = ', err.data.message);
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
// CONTROLLER: Project Bucket Listing
//
// -----------------------------------------------------------------------------------
// controllerProjectBucketListing.$inject = ['$scope', 'Project', '$filter'];
// /* @ngInject */
// function controllerProjectBucketListing($scope, Project, $filter) {
// 	var projBuckets = this;

// 	projBuckets.panelSort = [
// 		{'field': 'name', 'name':'Name'},
// 		{'field': 'type', 'name':'Type'},
// 		{'field': 'progress', 'name':'Complete'}
// 	];

// 	$scope.$watch('filter', function(newValue) {
// 		// wait for project and get related buckets
// 		if (newValue === 'inprogress') {
// 			projBuckets.bucketsFiltered = $filter('projectBucketNotComplete')(projBuckets.buckets);
// 		} else {
// 			projBuckets.bucketsFiltered = projBuckets.buckets;
// 		}
// 	});



// 	$scope.$watch('project', function(newValue) {
// 		// wait for project and get related buckets
// 		projBuckets.buckets = newValue.buckets;
// 		console.log(newValue);
// 		projBuckets.bucketsFiltered = $filter('projectBucketNotComplete')(newValue.buckets);
// 	});


// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Research
//
// -----------------------------------------------------------------------------------
// controllerProjectResearch.$inject = ['$scope', 'Project', 'Utils'];
// /* @ngInject */
// function controllerProjectResearch($scope, Project, Utils) {
// 	var pr = this;
// 	pr.searchResults = {};

// 	pr.workSpaceLayers = [];

// 	pr.panelSort = [
// 		{'field': 'name', 'name':'Name'},
// 		{'field': 'type', 'name':'Type'},
// 		{'field': 'progress', 'name':'Complete'}
// 	];

// 	pr.sharedLayers = Utils.getCommonLayers();
// 	// Utils.getCommonLayers().then( function(res) {
// 	// 	pr.sharedLayers = res.data;
// 	// });

// 	pr.researchFocus = Utils.getResearchFocus();


// 	pr.performSearch = function() {
// 		Utils.getResearchResults({'term': pr.search.focus}).then( function(res) {
// 			pr.searchResults.records = res.data;
// 			pr.searchResults.terms = pr.search.focus;
// 		});
// 	};

// 	$scope.$watch('project', function(newValue) {
// 		// wait for project and get related buckets
// 		if (newValue) {
// 			pr.buckets = newValue.buckets;
// 		}

// 		// Project.getProjectBuckets(newValue).then( function(res) {
// 		// 	pr.buckets = res.data;
// 		// });

// 		// Project.getProjectLayers(newValue).then( function(res) {
// 		// 	pr.projectLayers = res.data;
// 		// 	pr.workSpaceLayers.push({"name":"Project", "layers": res.data});
// 		// });

// 		// Project.getProjectTags(newValue).then( function(res) {
// 		// 	pr.projectTags = res.data;
// 		// });

// 		// Project.getProjectResearch(newValue).then( function(res) {
// 		// 	pr.projectResearch = res.data;
// 		// });

// 		// Project.getProjectRelatedResearch(newValue).then( function(res) {
// 		// 	pr.projectRelatedResearch = res.data;
// 		// });

// 	});


// }




// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Project New
//
// -----------------------------------------------------------------------------------
// controllerProjectEdit.$inject = ['$state', 'Project', '_'];
// /* @ngInject */
// function controllerProjectEdit($state, Project, _) {
// 	var projectEntry = this;


// 	Project.getProject({id: $state.params.id}).then( function(res) {
// 		projectEntry.project = res.data;
// 	});

// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Initiated
//
// -----------------------------------------------------------------------------------
controllerProjectInitiated.$inject = ['$scope', '$state'];
/* @ngInject */
function controllerProjectInitiated($scope, $state) {
	var projectInitiated = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			projectInitiated.project = newValue;
		}
	});

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Stream Selection
//
// -----------------------------------------------------------------------------------
controllerProjectStreamSelect.$inject = ['$scope', '$state', 'ProjectModel', 'StreamModel', '_'];
/* @ngInject */
function controllerProjectStreamSelect($scope, $state, ProjectModel, StreamModel, _) {
	var projectStreamSelect = this;

	this.project = $scope.project;

	// $scope.$watch('project', function(newValue) {
	// 	if (newValue) {
	// 		ProjectModel.getModel(newValue._id).then( function(data) {
	// 			projectStreamSelect.project = data;
	// 		});
	// 	}
	// });


	StreamModel.getCollection().then(function(data){
		projectStreamSelect.streams = data;
	});

	// admin users can set the project stream
	projectStreamSelect.setProjectStream = function() {
		if ((!projectStreamSelect.project.stream || projectStreamSelect.project.stream === '') && projectStreamSelect.newStreamId) {
			//
			// CC : the status canges are now part of the business rules and so this
			// portion moves to the back end, no need for a save prior to set
			//
			// projectStreamSelect.project.status = 'In Progress';
			// ProjectModel.saveModel().then( function(res) {
				// set the stream then move to the project overview page.
				ProjectModel.setModel ($scope.project);
				ProjectModel.setStream(projectStreamSelect.newStreamId).then( function(resStream) {
					projectStreamSelect.project = _.assign(resStream);
					$state.go('p.detail', {'projectid':projectStreamSelect.project.code}, {reload: true});
				});
			// });
		}
	};
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Activities
//
// -----------------------------------------------------------------------------------
controllerProjectActivities.$inject = ['$scope', '$rootScope', 'Authentication', 'sActivity', '_', 'PhaseModel', 'MilestoneModel' ,'ActivityModel', '$cookies'];
/* @ngInject */
function controllerProjectActivities($scope, $rootScope, sAuthentication, sActivity, _, sPhaseModel, sMilestoneModel ,sActivityModel, $cookies) {
	var projectActs = this;

	projectActs.selectedPhaseId = $cookies.phase;
	projectActs.selectedMilestoneId = $cookies.milestone;


	projectActs.selectPhase = function(phase) {
		if (phase) {
			projectActs.selectedPhase = phase;
			if ($cookies.phase !== phase._id) {
				$cookies.phase = phase._id;
				// the phase has changed, reset the structures down the chain.
				$cookies.milestone = undefined;
				projectActs.milestones = undefined;
				projectActs.activities = undefined;
				projectActs.selectedMilestone = undefined;
			}
			sMilestoneModel.milestonesForPhase(phase._id).then( function(data) {
				projectActs.milestones = data;
				// if there is also a milestone, select that when the milestones have loaded.
				$scope.$apply();
			});
		}
	};


	projectActs.selectMilestone = function(milestone) {
		if (milestone) {
			projectActs.selectedMilestone = milestone;
			if ($cookies.milestone !== milestone._id) {
				$cookies.milestone = milestone._id;
				// the phase has changed, reset the structures down the chain.
				projectActs.activities = undefined;
			}
			$cookies.milestone = milestone._id;
			sActivityModel.activitiesForMilestone(milestone._id).then( function(data) {
				projectActs.activities = data;
				$scope.$apply();
			});
		}
	};

	var unbind = $rootScope.$on('refreshActivitiesForMilestone', function(event, data) {
		console.log(data.milestone);
		projectActs.selectMilestone(data.milestone);
	});
	$scope.$on('$destroy',unbind);


	// wait until the list of phases loads.
	// if one is set in the cookie, select it.
	// this is triggered from the project load below.
	$scope.$watch(function () {
		return projectActs.phases;
	},function(newValue){
		// if there is a preset, find and select it.
		if (projectActs.selectedPhaseId && newValue) {
			_.each( newValue, function(phase) {
				if (phase._id === projectActs.selectedPhaseId) {
					projectActs.selectPhase( phase );
				}
			});
		}
	});


	// select a milestone if there is one.
	$scope.$watch(function () {
		return projectActs.milestones;
	},function(newValue){
		console.log('mile', newValue);
		// if there is a preset, select it.
		if (projectActs.selectedMilestoneId && newValue) {
			_.each( newValue, function(milestone) {
				if (milestone._id === projectActs.selectedMilestoneId) {
					projectActs.selectMilestone( milestone );
				}
			});
		}

	});


	$scope.$watch( 'project', function(newValue) {
		if (newValue) {
			projectActs.project = newValue;

			sPhaseModel.phasesForProject(newValue._id).then( function(data) {
				projectActs.phases = data;
			});
		}
	});

}
