'use strict';

angular.module('projectdescription')
	.controller('controllerProjectDescriptionRead', controllerProjectDescriptionRead)
	.controller('controllerProjectDescriptionEdit', controllerProjectDescriptionEdit);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Project Detail
//
// -----------------------------------------------------------------------------------
controllerProjectDescriptionRead.$inject = ['$scope', '$state', 'Authentication', '_', 'ProjectDescriptionModel'];
/* @ngInject */
function controllerProjectDescriptionRead ($scope, $state, sAuthentication, _, sProjectDescriptionModel) {
	// ui-sref="route.route({projectid:model.projectid})"
	//$state.go (route.route, {projectid:$scope.projectid})

	var projDesc = this;

	$scope.$watch('project', function(newProject) {
		if (newProject) {
			projDesc.project = newProject;
			sProjectDescriptionModel.getDescriptionsForProject (newProject._id)
			.then (function (descriptions) {
				projDesc.data = descriptions[0];
			});
		}
	});
}


// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Project Description Edit
//
// -----------------------------------------------------------------------------------
controllerProjectDescriptionEdit.$inject = ['$scope', '$state', 'Authentication', '_', 'ProjectModel', 'ProjectDescriptionModel'];
/* @ngInject */
function controllerProjectDescriptionEdit ($scope, $state, sAuthentication, _, sProjectModel, sProjectDescriptionModel) {
	var projDescEdit = this;

	sProjectModel.getModel($state.params.project).then( function(data) {
		projDescEdit.project = data;
	});

	sProjectDescriptionModel.getDescriptionsForProject ($state.params.project)
	.then (function (descriptions) {
		projDescEdit.data = descriptions[0];
	});
}





