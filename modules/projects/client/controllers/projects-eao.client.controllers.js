'use strict';

angular.module('projects')
	// EAO
	.controller('controllerEAOProjects', controllerEAOProjects);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Projects Main
//
// -----------------------------------------------------------------------------------
controllerEAOProjects.$inject = ['$scope', '$state', 'Projects', 'Global', '_'];
/* @ngInject */
function controllerEAOProjects($scope, $state, Projects, Global, _) {
	var vm = this;

	vm.intakes = [];
	vm.projects = [];
	vm.filter = {};
	
	// get projects
	Projects.getProjects().then( function(res) {
		_.each( res.data, function( project, idx ) {
			if (!project.stream || project.stream === '') {
				// the project becomes an intake and the stream needs to be defined.
				vm.intakes.push(project);
			} else {
				// the project is already in a stream, show in the ongoing list.
				vm.projects.push(project);
			}
		});
	});

	vm.proponent = Global.user;

	vm.panelSort = [
		{'field': 'name', 'name':'Title'},
		{'field': 'region', 'name':'Region'},	
		{'field': 'currentPhaseCode', 'name':'Phase'},
		{'field': 'dateUpdated', 'name':'Date Updated'},
		{'field': 'dateCreate', 'name':'Date Created'},			
	];

}        
