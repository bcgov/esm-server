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
controllerProjectsFilterBar.$inject = ['$scope', '$state', 'Projects', 'Global', '$filter'];
/* @ngInject */
function controllerProjectsFilterBar($scope, $state, Projects, Global, $filter) {
	var fbc = this;

	fbc.types = Projects.getProjectTypes();

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

	fbc.userType = Global.user.type;
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects
//
// -----------------------------------------------------------------------------------
controllerProjectsList.$inject = ['$scope', '$state', 'Global'];
/* @ngInject */
function controllerProjectsList($scope, $state, Global) {
	var projectList = this;
	
	$scope.$watch('projects', function(newValue) {
		projectList.projects = newValue;
	});

	projectList.goToProject = function(projectId) {
		if (Global.user.type === 'eao') {
			$state.go('eao.project', {id:projectId});
		} else {
			$state.go('public.project', ({id:projectId}));
		}
	};
	
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Projects Intake
//
// -----------------------------------------------------------------------------------
controllerProjectsIntake.$inject = ['$scope', '$state', 'Global'];
/* @ngInject */
function controllerProjectsIntake($scope, $state, Global) {
	var projectIntakeList = this;

	$scope.$watch('projects', function(newValue) {
		console.log(newValue);
		projectIntakeList.projects = newValue;
	});

	projectIntakeList.goToProject = function(projectId) {
		if (Global.user.type === 'eao') {
			$state.go('eao.project', {id:projectId});
		} else {
			$state.go('public.project', ({id:projectId}));
		}
	};
	
}
