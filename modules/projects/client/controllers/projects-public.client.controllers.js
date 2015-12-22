'use strict';

angular.module('projects')
	// Public
	.controller('controllerPublicProjects', controllerPublicProjects);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Projects Main
//
// -----------------------------------------------------------------------------------
controllerPublicProjects.$inject = ['$state', 'Projects', 'PROJECT_TYPES'];
/* @ngInject */
function controllerPublicProjects($state, Projects, PROJECT_TYPES) {
	var vm = this;

	vm.types = PROJECT_TYPES;

	Projects.getProjects().then( function(res) {
		vm.projects = res.data;
	});
	
	vm.filterKeyword = '';
	vm.filterObject = {};
	vm.view = 'map';
	
}
