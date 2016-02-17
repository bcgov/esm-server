'use strict';

angular.module('project')
	// General
	.controller('controllerProject', controllerProject)
	.controller('controllerModalProjectSchedule', controllerModalProjectSchedule)
	.controller('controllerProjectVC', controllerProjectVC)
	.controller('controllerProjectTombstone', controllerProjectTombstone)
	// .controller('controllerProjectTimeline', controllerProjectTimeline)
	.controller('controllerModalProjectEntry', controllerModalProjectEntry)
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
			proj.project = data;
			$scope.$apply();
		}).catch( function(err) {
			$scope.error = err;
		});
	};

	$rootScope.$on('refreshProject', function() {
		proj.refresh();
	});

	proj.refresh();

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectSchedule.$inject = ['$modalInstance', 'ProjectModel', '_'];
/* @ngInject */
function controllerModalProjectSchedule($modalInstance, ProjectModel, _) {
	var projSched = this;

	// TODO.  Revert
	projSched.project = angular.copy(ProjectModel.model);

	projSched.cancel = function () { $modalInstance.dismiss('cancel'); };
	projSched.ok = function () {
		_.assign(ProjectModel.model, projSched.project);
		ProjectModel.saveModel().then( function(data) {
			$modalInstance.close(data);
		});
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project VC
//
// -----------------------------------------------------------------------------------
controllerProjectVC.$inject = ['rProjectVC', '_', '$modalInstance'];
/* @ngInject */
function controllerProjectVC(rProjectVC, _, $modalInstance) {
	var projectVC = this;

	projectVC.roles = ['admin', 'project-team', 'working-group', 'first-nations', 'consultant'];

	// on save, pass complete permission structure to the server
	projectVC.ok = function () {
		$modalInstance.close();
	};
	projectVC.cancel = function () { $modalInstance.dismiss('cancel'); };

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

	projTomb.project = ProjectModel.model;
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
controllerModalProjectEntry.$inject = ['$modalInstance', '$scope', '$state', 'Project',  'ProjectModel', 'rProject', 'REGIONS', 'PROJECT_TYPES', '_'];
/* @ngInject */
function controllerModalProjectEntry($modalInstance, $scope, $state, sProject, sProjectModel, rProject, REGIONS, PROJECT_TYPES, _) {
	var projectEntry = this;

	projectEntry.regions = REGIONS;
	projectEntry.types = PROJECT_TYPES;

	projectEntry.questions = sProject.getProjectIntakeQuestions();
	projectEntry.form = {curTab: $state.params.tab};

	// if a project is already there, we're in edit mode.
	if (rProject) {
		projectEntry.title = 'Edit Project';
		sProjectModel.setModel(rProject);
		projectEntry.project = sProjectModel.getCopy();
		// project has been passed in, no need to get it again.
	} else {
		// no project set to presume new mode.
		projectEntry.title = 'Add Project';
		// no project exists, get a new blank one.
		sProjectModel.getNew().then( function(data) {
			console.log('getnew');
			projectEntry.project = data;
		});
	}

	projectEntry.cancel = function () {
		$modalInstance.dismiss();
	};

	// Standard save make sure documents are uploaded before save.
	projectEntry.saveProject = function() {
		sProjectModel.saveCopy(projectEntry.project).then( function(data) {
			rProject = data;
			$modalInstance.close(data);
		})
		.catch (function (err) {
			console.log ('error = ', err, 'message = ', err.data.message);
		});
	};

	// Submit the project for stream assignment.
	projectEntry.submitProject = function() {
		projectEntry.project.status = 'Submitted';
		projectEntry.saveProject();
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

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			ProjectModel.getModel(newValue._id).then( function(data) {
				projectStreamSelect.project = data;
			});
		}
	});


	StreamModel.getCollection().then(function(data){
		projectStreamSelect.streams = data;
	});

	// admin users can set the project stream
	projectStreamSelect.setProjectStream = function() {
		if ((!projectStreamSelect.project.stream || projectStreamSelect.project.stream === '') && projectStreamSelect.newStreamId) {
			projectStreamSelect.project.status = 'In Progress';

			ProjectModel.saveModel().then( function(res) {
				// set the stream then move to the project overview page.
				ProjectModel.setStream(projectStreamSelect.newStreamId).then( function(resStream) {
					projectStreamSelect.project = _.assign(resStream);
					$state.go('project', {'id':projectStreamSelect.project._id}, {reload: true});
				});
			});
		}
	};
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Activities
//
// -----------------------------------------------------------------------------------
controllerProjectActivities.$inject = ['$scope', 'sActivity', '_', 'PhaseModel', 'MilestoneModel' ,'ActivityModel'];
/* @ngInject */
function controllerProjectActivities($scope, sActivity, _, sPhaseModel, sMilestoneModel ,sActivityModel) {
	var projectActs = this;



	projectActs.selectPhase = function(phase) {
		if (phase) {
			console.log('set phase', phase.name);
			projectActs.selectedPhase = phase;
			sMilestoneModel.milestonesForPhase(phase._id).then( function(data) {
				projectActs.milestones = data;
				$scope.$apply();
			});
		}
	};


	projectActs.selectMilestone = function(milestone) {
		if (milestone) {
			console.log('set milestone', milestone.name);
			projectActs.selectedMilestone = milestone;
			sActivityModel.activitiesForMilestone(milestone._id).then( function(data) {
				projectActs.activities = data;
				$scope.$apply();
			});
		}
	};



	$scope.$watch( 'project', function(newValue) {
		if (newValue) {
			projectActs.project = newValue;

			sPhaseModel.phasesForProject(newValue._id).then( function(data) {
				console.log('phases', data);
				projectActs.phases = data;
			});

			// sActivity.getProjectActivities().then( function(res) {
			// 	projectActs.activities = res.data;
			// });
		}
	});

}





