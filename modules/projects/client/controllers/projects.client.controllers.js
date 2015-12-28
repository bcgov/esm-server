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

	Projects.getProjectMilestones().then( function(res) {
		fbc.milestones = res.data;
	});

	fbc.filter = {filterKeyword: '', filterObject: {}};

	$scope.$watch('data', function(newValue) {
		fbc.data = newValue;
	});		

	fbc.updateFilter = function() {
		if( fbc.data.intakes ) {
			fbc.data.intakes = $filter('projects')(fbc.filter);
		}
		if ( fbc.data.projects) {
			fbc.data.projects = $filter('projects')(fbc.filter);
		}
	};

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects
//
// -----------------------------------------------------------------------------------
controllerProjectsList.$inject = ['$scope', '$state', 'Authentication'];
/* @ngInject */
function controllerProjectsList($scope, $state, Authentication) {
	var projectList = this;
	
	$scope.$watch('projects', function(newValue) {
		projectList.projects = newValue;
	});

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
