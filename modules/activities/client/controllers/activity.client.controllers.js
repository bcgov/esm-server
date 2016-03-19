'use strict';

angular.module('activity')
	.controller('controllerActivity', controllerActivity);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Activity EAO
//
// -----------------------------------------------------------------------------------
controllerActivity.$inject = ['$scope', '$state', '$modal', 'sActivity', 'Project', '$stateParams'];
/* @ngInject */
function controllerActivity($scope, $state, $modal, sActivity, Project, $stateParams) {
	var actBase = this;
	//
	// Get Activity

	Project.getProject({id: $state.params.project}).then( function(res) {
		actBase.project = res.data;
	});

	sActivity.getActivity({id: $state.params.activity}).then(function(res) {
		actBase.activity = res.data;
	});
}		
