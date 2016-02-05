'use strict';

angular.module('activity')
	.controller('controllerActivity', controllerActivity);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Activity EAO
//
// -----------------------------------------------------------------------------------
controllerActivity.$inject = ['$scope', '$state', '$modal', 'Activity', 'Project', '$stateParams'];
/* @ngInject */
function controllerActivity($scope, $state, $modal, Activity, Project, $stateParams) {
	var actBase = this;
	//
	// Get Activity
	Activity.getProjectActivity({id: $state.params.id}).then(function(res) {
		actBase.activity = res.data;
		//
		// Get Project
		Project.getProject({id: res.data.project}).then(function(res) {
			actBase.project = res.data;
		});
	});
}		
