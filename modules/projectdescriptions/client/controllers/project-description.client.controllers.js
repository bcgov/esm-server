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
			sProjectDescriptionModel.getCurrentProjectDescription (newProject._id)
			.then (function (description) {
				console.log('single desc', description);
				projDesc.data = description;
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
		if (descriptions.length === 0) {
			// add new model
			sProjectDescriptionModel.new().then( function(newDesc) {
				projDescEdit.data = newDesc;

				sProjectDescriptionModel.setModel(newDesc);

				console.log(newDesc);
			});
		} else {
			projDescEdit.versions = descriptions;
			projDescEdit.data = descriptions[0];

			sProjectDescriptionModel.setModel(descriptions[0]);
		}
	});

	projDescEdit.save = function(type) {
		sProjectDescriptionModel.saveAs(type).then( function(resp) {
			console.log('saved', resp);
		});
	};

}





