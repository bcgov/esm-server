'use strict';

angular.module('project')
	// General
	.controller('controllerProject', controllerProject)
	.controller('controllerModalProjectSchedule', controllerModalProjectSchedule)
	.controller('controllerProjectTombstone', controllerProjectTombstone)
	// .controller('controllerProjectTimeline', controllerProjectTimeline)
	.controller('controllerModalProjectEntry', controllerModalProjectEntry)
	// .controller('controllerProjectProponent', controllerProjectProponent)
	// .controller('controllerProjectBucketListing', controllerProjectBucketListing)
	// .controller('controllerProjectResearch', controllerProjectResearch)

	// .controller('controllerProjectNew', controllerProjectNew)
	// .controller('controllerProjectEdit', controllerProjectEdit)
	.controller('controllerProjectStreamSelect', controllerProjectStreamSelect)
	.controller('controllerProjectActivities', controllerProjectActivities);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Project Detail
//
// -----------------------------------------------------------------------------------
controllerProject.$inject = ['Project', '$stateParams', '_'];
/* @ngInject */
function controllerProject(Project, $stateParams, _) {
	var proj = this;

	Project.getProject({id: $stateParams.id}).then(function(res) {
		proj.project = res.data;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Project Schedule
//
// -----------------------------------------------------------------------------------
controllerModalProjectSchedule.$inject = ['$modalInstance', 'rProject', 'Project'];
/* @ngInject */
function controllerModalProjectSchedule($modalInstance, rProject, Project) {
	var projSched = this;

	projSched.project = angular.copy(rProject);

	projSched.cancel = function () { $modalInstance.dismiss('cancel'); };
	projSched.ok = function () {
		Project.saveProject(projSched.project).then( function(res) {
			$modalInstance.close(res.data);
		});
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Project Tombstone
//
// -----------------------------------------------------------------------------------
controllerProjectTombstone.$inject = ['$scope'];
/* @ngInject */
function controllerProjectTombstone($scope) {
	var projTomb = this;

	$scope.$watch('project', function(newValue) {
		projTomb.project = newValue;
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
controllerModalProjectEntry.$inject = ['ProjectModel', '$modalInstance', '$scope', '$state', 'Project', 'rProject', 'REGIONS', 'PROJECT_TYPES', '_'];
/* @ngInject */
function controllerModalProjectEntry(ProjectModel, $modalInstance, $scope, $state, Project, rProject, REGIONS, PROJECT_TYPES, _) {
	ProjectModel.getModel ('56afbc7dc12ae49036223870')
	// ProjectModel.getCollection ()
	.then (function (models) {
		console.log ('got some models', models);
	})
	.catch (function (err) {
		console.log ('error! ',err);
	});


	var projectEntry = this;

	projectEntry.regions = REGIONS;
	projectEntry.types = PROJECT_TYPES;

	projectEntry.questions = Project.getProjectIntakeQuestions();
	projectEntry.form = {curTab: $state.params.tab};

	if (rProject) {
		projectEntry.title = 'Edit Project';
		projectEntry.project = rProject;
		// project has been passed in, no need to get it again.
	} else {
		projectEntry.title = 'Add Project';
		// no project exists, get a new blank one.
		Project.getNewProject().then( function(res) {
			projectEntry.project = res.data;
		});
	}

	projectEntry.cancel = function () {
		$modalInstance.dismiss();
	};

	projectEntry.submitProject = function() {
		projectEntry.project.status = 'Submitted';
		projectEntry.saveProject();
	};

	projectEntry.saveProject = function() {
		if (!rProject) {
			Project.addProject(projectEntry.project).then( function(res) {
				console.log (res.data);
				$modalInstance.close(res.data);
			})
			.catch (function (err) {
				console.log ('error = ', err, 'message = ', err.data.message);
			});
		} else {
			Project.saveProject(projectEntry.project).then( function(res) {
				$modalInstance.close(res.data);
			})
			.catch (function (err) {
				console.log ('error = ', err, 'message = ', err.data.message);
			});
		}
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
// CONTROLLER: Stream Selection
//
// -----------------------------------------------------------------------------------
controllerProjectStreamSelect.$inject = ['$state', 'Project', 'sConfiguration', '_'];
/* @ngInject */
function controllerProjectStreamSelect($state, sProject, sConfiguration, _) {
	var projectStreamSelect = this;

	sProject.getProject({id: $state.params.id}).then( function(res) {
		projectStreamSelect.project = res.data;
	});

	sConfiguration.getStreams().then(function(res){
		projectStreamSelect.streams = res.data;
	});

	// admin users can set the project stream
	projectStreamSelect.setProjectStream = function() {
		if ((!projectStreamSelect.project.stream || projectStreamSelect.project.stream === '') && projectStreamSelect.newStream) {
			projectStreamSelect.project.status = 'In Progress';
			sProject.saveProject(projectStreamSelect.project).then( function(res) {
				// set the stream then move to the project overview page.
				sProject.setProjectStream(projectStreamSelect.project._id, projectStreamSelect.newStream).then( function(resStream) {
					projectStreamSelect.project = _.assign(resStream.data);
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
controllerProjectActivities.$inject = ['$scope', 'sActivity', '_'];
/* @ngInject */
function controllerProjectActivities($scope, sActivity, _) {
	var projectActs = this;

	$scope.$watch( 'project', function(newValue) {
		if (newValue) {
			projectActs.project = newValue;

			sActivity.getProjectActivities().then( function(res) {
				projectActs.activities = res.data;
			});
		}
	});

}





