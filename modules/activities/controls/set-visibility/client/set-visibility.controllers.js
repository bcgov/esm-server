'use strict';

angular.module('control')
	.controller('controllerprocesseStartProcess', controllerProcesseStartProcess);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcesseStartProcess.$inject = ['$scope', '$rootScope', 'ProjectModel'];
	//
function controllerProcesseStartProcess($scope, $rootScope, sProjectModel) {
	var ctrlSetVis = this;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			ctrlSetVis.project = newValue;
		}
	});

	ctrlSetVis.togglePublic = function() {

		// TO DO: modify roles instead.
		ctrlSetVis.project.public = !ctrlSetVis.project.public;
		sProjectModel.setModel(ctrlSetVis.project);
		sProjectModel.saveModel().then( function(data) {
			ctrlSetVis.project = data;
		});
	};



}
