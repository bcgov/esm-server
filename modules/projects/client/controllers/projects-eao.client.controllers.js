'use strict';

angular.module('projects')
	// EAO
	.controller('controllerEAOProjects', controllerEAOProjects);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: EAO Projects Main
//
// -----------------------------------------------------------------------------------
controllerEAOProjects.$inject = ['$scope', '$state', 'Projects', '_'];
/* @ngInject */
function controllerEAOProjects($scope, $state, Projects, _) {
	var vm = this;

	vm.intakes = [];
	vm.projects = [];
	vm.filter = {};
	
	// get projects
	Projects.getProjects().then( function(res) {
		vm.projects = res.data;
		console.log(res.data);
	});

	// panel sort maps fields to names, when clicked the associated table sorts accordingly
	vm.panelSort = [
		{'field': 'name', 'name':'Name'},
		{'field': 'status', 'name':'Status'},	
		{'field': 'dateUpdated', 'name':'Date Updated'},
		{'field': 'dateCreate', 'name':'Date Created'}
	];

}        
