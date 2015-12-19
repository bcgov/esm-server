'use strict';

angular.module('project')
	// Public
	.controller('controllerPublicProject', controllerPublicProject)
	.controller('controllerModalAddComment', controllerModalAddComment);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Project Detail
//
// -----------------------------------------------------------------------------------
controllerPublicProject.$inject = ['logger', '$modal', 'Project', '$stateParams'];
//
function controllerPublicProject(logger, $modal, Project, $stateParams) {
	var vm = this;

	vm.commentsByDate = {};
	vm.commentsByDateVis = {name: 'byDate', children:[]};
	vm.refreshVisualization = 0;
	//
	// Get Project
	Project.getProject({id: $stateParams.id}).then(function(res) {
		vm.project = res.data;
		// get public comments and sort into date groups.
		Project.getPublicCommentsPublished(res.data._id).then(function(res) {
			vm.comments = res.data;

			var dateCount = {};
			var dateTitle = '';
			// separate the comments for bubble visualization
			_.each(res.data, function(item) {
				dateTitle = moment(item.dateAdded).format("MMM Do");
				dateCount[dateTitle] = (dateCount[dateTitle]++ || 1);
				if (!vm.commentsByDate[dateTitle]) vm.commentsByDate[dateTitle] = [];
				vm.commentsByDate[dateTitle].push(item);
			});
			
			_.each(dateCount, function(num, key) {
				vm.commentsByDateVis.children.push({'name': key, 'size': num});
			});

			// trigger the d3 to draw.
			vm.refreshVisualization = 1;
		});

	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Add Anon Comment
//
// -----------------------------------------------------------------------------------
controllerModalAddComment.$inject = ['$modalInstance', 'Project', 'rProject'];
//
function controllerModalAddComment($modalInstance, Project, rProject) { 
	var publicComment = this;

	Project.getNewPublicComment().then( function(res) {
		publicComment.data = res.data;
		publicComment.data.project = rProject._id;
	});

	publicComment.ok = function () {
		Project.addPublicComment(publicComment.data).then( function(res) {
			$modalInstance.close();				
		});
	};
	
	publicComment.cancel = function () { $modalInstance.dismiss('cancel'); };
}
