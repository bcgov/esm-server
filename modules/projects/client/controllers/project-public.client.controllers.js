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
	vm.commentsByTopicKeys = {};
	vm.commentsByDateVis = {name: 'byDate', children:[]};
	vm.commentsByTopicVis = {name: 'byTopic', children:[]};
	vm.refreshVisualization = 0;
	//
	// Get Project
	Project.getProject({id: $stateParams.id}).then(function(res) {
		vm.project = res.data;
	
		vm.bucketGroups = _.unique(_.pluck(vm.project.buckets, 'group'));

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
					if( bucket.name ) {
						if (!vm.commentsByTopic) vm.commentsByTopic = {};
						if (!vm.commentsByTopic[bucket.name]) vm.commentsByTopic[bucket.name] = [];
						vm.commentsByTopic[bucket.name].push(item);

						// make a structure of keys to filter on key meta.
						if (!vm.commentsByTopicKeys[bucket.name]) vm.commentsByTopicKeys[bucket.name] = {name:bucket.name, group:bucket.group};

						// is the bucket already in the visualization?						
						var findBucket = _.find(vm.commentsByTopicVis.children, function(o) {
							return o.name === bucket.name;
						});

						if (!findBucket) {
							vm.commentsByTopicVis.children.push({name: bucket.name, size: 1});
						} else {
							findBucket.size++;
						}

					}
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

	publicComment.send = function (isValid) {
		// indicate submission so the docmentUploadComplete event will take care of the close.
		if(isValid) {
			commentSubmitted = true;
			$scope.$broadcast('documentUploadStart');
		} else {
			$scope.$broadcast('show-errors-check-validity', 'publicCommentForm');
		}
	};
	
	publicComment.ok = function () {
		$modalInstance.close();
		publicComment.step = 2;
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
		publicComment.step = 2;
	};
}
