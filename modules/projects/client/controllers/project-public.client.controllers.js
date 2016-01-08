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
controllerPublicProject.$inject = ['$modal', 'Project', '$stateParams', '_', 'moment', '$filter'];
/* @ngInject */
function controllerPublicProject($modal, Project, $stateParams, _, moment, $filter) {
	var vm = this;

	vm.commentsByDateKeys = [];
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
			var dateTitleNoSort = '';

			// separate the comments for bubble visualization
			_.each(vm.comments, function(item) {

				if(!vm.commentsByDate) vm.commentsByDate = {};

				// get the comment date in a month and day to sort into headings
				dateTitle = moment(item.dateAdded).format("YYYYMMDD-MMM Do");
				dateTitleNoSort = moment(item.dateAdded).format("MMM Do");

				// if this heading doens't exist, create it.
				if (!dateCount[dateTitleNoSort]) dateCount[dateTitleNoSort] = 0;
				dateCount[dateTitleNoSort]++;

				// add the comment to a date list for display.
				if (!vm.commentsByDate[dateTitle]) vm.commentsByDate[dateTitle] = [];
				vm.commentsByDateKeys.push(dateTitle);
				vm.commentsByDate[dateTitle].push(item);

				// add the comment to a bucket list for display.
				_.each(item.buckets, function(bucket) {
					if (!vm.commentsByTopic) vm.commentsByTopic = {};
					if (!vm.commentsByTopic[bucket.name]) vm.commentsByTopic[bucket.name] = [];
					vm.commentsByDate[bucket.name].push(item);
				});
			});

			vm.commentsByDateKeys = _.unique(vm.commentsByDateKeys);

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
/* @ngInject */
function controllerModalAddComment($modalInstance, $scope, Project, rProject) { 
	var publicComment = this;
	var commentSubmitted = false;

	publicComment.project = rProject;
	// sent variable changes the template UI to say thanks.
	publicComment.sent = false;

	if (!publicComment.step) {
		publicComment.step = 1;
	}

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
		if( commentSubmitted ) {
			Project.addPublicComment(publicComment.data).then( function(res) {
				publicComment.step = 3;
				publicComment.sent = true;
			});
		}
	});

	publicComment.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}
