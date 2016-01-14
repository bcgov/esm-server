'use strict';

angular.module('projects')
	// General
	.controller('controllerProjectsFilterBar', controllerProjectsFilterBar)
	.controller('controllerProjectsList', controllerProjectsList)
	.controller('controllerProjectsIntake', controllerProjectsIntake);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Filter Bar
//
// -----------------------------------------------------------------------------------
controllerProjectsFilterBar.$inject = ['$scope', '$state', 'Projects', '$filter', 'PROJECT_TYPES', 'Authentication'];
/* @ngInject */
function controllerProjectsFilterBar($scope, $state, Projects, $filter, PROJECT_TYPES, Authentication) {
	var fbc = this;

	fbc.types = PROJECT_TYPES;

	fbc.filter = null;

	$scope.$watch('data', function(newValue) {
		if(newValue) {
			fbc.data = newValue;
		}
	});

	fbc.updateFilter = function() {
		console.log('filter', fbc.filter, fbc.data );
		if(fbc.filter.$ === '') {
			delete fbc.filter.$;
		}
		if(Object.keys(fbc.filter).length === 0) {
			fbc.filter = null;
		}

		console.log('filter', fbc.filter);
		fbc.data.projects = $filter('filter')(fbc.data.projects, fbc.filter);
	};

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects
//
// -----------------------------------------------------------------------------------
controllerProjectsList.$inject = ['$scope', '$state', 'Authentication', 'Project'];
/* @ngInject */
function controllerProjectsList($scope, $state, Authentication, Project) {
	var projectList = this;
	
	$scope.$watch('projects', function(newValue) {
		projectList.projects = newValue;
	});


	// when clicking on the schedule view, if there only one activity, just go there.
	projectList.optimizedSelectProject = function(projectId) {

		Project.getProject({id: projectId}).then(function(res) {
			if (res.data.activities.length !== 1) {
				$state.go('eao.project', {id:projectId});
			} else {
				$state.go('eao.activity', {id:res.data.activities[0]._id});
			}
		});	

	};

	projectList.auth = Authentication;	
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects Intake
//
// -----------------------------------------------------------------------------------
controllerProjectsIntake.$inject = ['$scope', '$state'];
/* @ngInject */
function controllerProjectsIntake($scope, $state) {
	var projectIntakeList = this;

	$scope.$watch('projects', function(newValue) {
		projectIntakeList.projects = newValue;
	});

	projectIntakeList.goToProject = function(projectId) {
		$state.go('eao.project', {id:projectId});
	};
	
}
