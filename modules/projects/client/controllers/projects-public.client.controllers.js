'use strict';

angular.module('projects')
	// Public
	.controller('controllerPublicProjects', controllerPublicProjects);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Projects Main
//
// -----------------------------------------------------------------------------------
controllerPublicProjects.$inject = ['logger', '$state', 'Projects'];
/* @ngInject */
function controllerPublicProjects(logger, $state, Projects) {
	var vm = this;

	vm.types = Projects.getProjectTypes();

	Projects.getProjects().then( function(res) {
		vm.projects = res.data;
	});

	//
	vm.goToProject = function(id) {
		$state.go('public.project', {id:id});
	};	
	
	vm.filterKeyword = '';
	vm.filterObject = {};
	vm.view = 'map';
	
}
