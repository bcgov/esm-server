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
controllerPublicProject.$inject = ['$modal', 'Project', '$stateParams', '_', 'moment'];
//
function controllerPublicProject($modal, Project, $stateParams, _, moment) {
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
				if (!dateCount[dateTitle]) dateCount[dateTitle] = 0;
				dateCount[dateTitle]++;
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
controllerModalAddComment.$inject = ['$modalInstance', '$scope', 'Project', 'rProject'];
//
function controllerModalAddComment($modalInstance, $scope, Project, rProject) { 
	var publicComment = this;
	var commentSubmitted = false;

	publicComment.project = rProject;
	// sent variable changes the template UI to say thanks.
	publicComment.sent = false;


	Project.getNewPublicComment().then( function(res) {
		publicComment.data = res.data;
		publicComment.data.project = rProject._id;
	});

	publicComment.send = function () {
		// indicate submission so the docmentUploadComplete event will take care of the close.
		commentSubmitted = true;
		$scope.$broadcast('documentUploadStart');
	};
	
	publicComment.ok = function () {
		$modalInstance.close();				
	};

	// Any posible document has been uploaded so now save the record.
	// If no documents, this is still triggered.
	$scope.$on('documentUploadComplete', function() {
				console.log('add comment doc upload');
		if( commentSubmitted ) {
			Project.addPublicComment(publicComment.data).then( function(res) {
				publicComment.sent = true;
			});
		}
	});

	publicComment.cancel = function () { $modalInstance.dismiss('cancel'); };
}
