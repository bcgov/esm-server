'use strict';

angular.module('projectdescription')
	.directive('tmplProjectDescriptionRead', directiveProjectDescriptionRead)
	.directive('tmplProjectDescriptionEdit', directiveProjectDescriptionEdit);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Description
//
// -----------------------------------------------------------------------------------
directiveProjectDescriptionRead.$inject = ['ProjectDescriptionModel'];
/* @ngInject */
function directiveProjectDescriptionRead(ProjectDescriptionModel) {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projectdescriptions/client/views/project-description-read.html',
		controller: 'controllerProjectDescriptionRead',
		controllerAs: 'projDesc',
		scope: {
			project: '='
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Description Edit
//
// -----------------------------------------------------------------------------------
directiveProjectDescriptionEdit.$inject = ['ProjectDescriptionModel'];
/* @ngInject */
function directiveProjectDescriptionEdit(ProjectDescriptionModel) {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projectdescriptions/client/views/project-description-edit.html',
		controller: 'controllerProjectDescriptionEdit',
		controllerAs: 'projDescEdit'
	};
	return directive;
}

