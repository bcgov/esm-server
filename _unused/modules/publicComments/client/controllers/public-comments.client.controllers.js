'use strict';

angular.module('publicComments')
	.controller('controllerPublicCommentsClassify', controllerPublicCommentsClassify)
	.controller('controllerModalAddComment', controllerModalAddComment)
	.controller('controllerPublicCommentDisplay', controllerPublicCommentDisplay);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerPublicCommentsClassify.$inject = ['$scope', '$rootScope', '_', 'sPublicComments', '$filter'];
/* @ngInject */
function controllerPublicCommentsClassify($scope, $rootScope, _, sPublicComments, $filter) {
	var pubComClass = this;

	// Keep track of the active comment for display of the edit controls.
	// Only one of these can be seen at a time.
	// All comparisons take place at the template level.
	pubComClass.filterScopeComment = false;
	pubComClass.filterScopeValueComponents = true;
	pubComClass.filterScopeTopics = true;

	// console.log($scope.single);
	pubComClass.singleMode = $scope.single;

	pubComClass.data = {comments: []};

	pubComClass.noClassificationPossible = false;
	// -----------------------------------------------------------------------------------
	//
	// Get the current project
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			pubComClass.project = newValue;

			// get the bucket groups for general classification
			pubComClass.bucketGroups = _.unique(_.pluck(pubComClass.project.buckets, 'group'));
			pubComClass.bucketsFiltered = [];

		}
	});
	// -----------------------------------------------------------------------------------
	//
	// Get the current project
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('comment', function(newValue) {
		if (newValue) {
			pubComClass.com = newValue;
			pubComClass.filterBucketsByPillars();
		}
	});

	// -----------------------------------------------------------------------------------
	//
	// Set Comment to Deferred and get another.
	//
	// -----------------------------------------------------------------------------------
	pubComClass.deferCommentStatus = function() {
		sPublicComments.setCommentDefer(pubComClass.com).then( function(res) {
			pubComClass.com = _.assign(pubComClass.com, res.data);
			// One has been deferred, get another comment.
			$scope.$emit('classifyFetchNewComment');
		});
	};
	// -----------------------------------------------------------------------------------
	//
	// Set Comment to Classified and get another.
	//
	// -----------------------------------------------------------------------------------
	pubComClass.finalizeCommentStatus = function() {
		// status change in progress
		if ((pubComClass.com.classification.length > 0) || (pubComClass.com.buckets && pubComClass.com.buckets.length > 0) || (pubComClass.com.topics && pubComClass.com.topics.length > 0) || (pubComClass.com.proponentNotes) || (pubComClass.com.returnedNotes)) {
			// proceed with status change
			// must have buckets or topics or a reason why not.

			//
			// on save, make sure the buckets set have their parents activiated too.
			_.each(pubComClass.com.buckets, function(bucket) {
				// check if the bucket group is in classification
				_.remove(pubComClass.com.buckets, function(bucket) {
					return (pubComClass.com.classification.indexOf(bucket.group) === -1);
				});
			});

			sPublicComments.setCommentClassify(pubComClass.com).then( function(res) {
			 	pubComClass.com = _.assign(pubComClass.com, res.data);

				// One has been classified, get another comment.
				$scope.$emit('classifyFetchNewComment');
			});

		} else {
			window.alert("Please select value components, topics before moving to the next comment or enter a reason for no validation.");
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Toggle the classifications (bucket groups) on Click
	//
	// -----------------------------------------------------------------------------------
	pubComClass.toggleBucketGroup = function(group) {
		if (pubComClass.com.classification.indexOf(group) > -1) {
			_.remove(pubComClass.com.classification, function(item) { return item === group; });
		} else {
			pubComClass.com.classification.push(group);
		}

		// filter the topics being displayed.
		pubComClass.filterBucketsByPillars();
	};
	// -----------------------------------------------------------------------------------
	//
	// Toggle the buckets (buckets) on Click
	//
	// -----------------------------------------------------------------------------------
	pubComClass.toggleBucket = function(bucket) {
		if (pubComClass.com.buckets.indexOf(bucket) > -1) {
			_.remove(pubComClass.com.buckets, function(item) { return item === bucket; });
		} else {
			pubComClass.com.buckets.push(bucket);
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Toggle the buckets (buckets) on Click
	//
	// -----------------------------------------------------------------------------------
	pubComClass.filterBucketsByPillars = function() {
		// filter bucket list for new classifications
		pubComClass.bucketsFiltered = $filter('filter')(pubComClass.project.buckets, function(item) {
			if (pubComClass.com.classification) {
				return (pubComClass.com.classification.indexOf(item.group) !== -1 );
			} else {
				return false;
			}
		});
	};
	// -----------------------------------------------------------------------------------
	//
	// Select all groups / pillars
	//
	// -----------------------------------------------------------------------------------
	pubComClass.selectAllGroups = function(selectAll) {
		if (selectAll) {
			pubComClass.com.classification = angular.copy(pubComClass.bucketGroups);
		} else {
			pubComClass.com.classification = [];
		}
		pubComClass.filterBucketsByPillars();
	};
	// -----------------------------------------------------------------------------------
	//
	// Select all topics
	//
	// -----------------------------------------------------------------------------------
	pubComClass.selectAllTopics = function(selectAll) {
		if (selectAll) {
			_.each(pubComClass.bucketsFiltered, function(item) {
				pubComClass.com.buckets.push(item);
			});
		} else {
			pubComClass.com.buckets = [];
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Is the topic selected, used in the ng-class in the topic select list.
	// t/f if the bucket has been selected or not
	//
	// -----------------------------------------------------------------------------------
	pubComClass.selectedBucket = function(bucket) {
		return _.some(pubComClass.com.buckets, function(item) {
			return item._id === bucket._id;
		});
	};

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


// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Comment Display
//
// -----------------------------------------------------------------------------------
controllerPublicCommentDisplay.$inject = ['$modal', 'Project', '$stateParams', '_', 'moment', '$filter', '$location'];
/* @ngInject */
function controllerPublicCommentDisplay($modal, Project, $stateParams, _, moment, $filter, $location) {
	var pubComDisp = this;

	pubComDisp.host = $location.protocol() + '://' + $location.host() + ($location.port() ? ':' + $location.port() : '');

	pubComDisp.commentsByDateKeys = [];
	pubComDisp.commentsByTopicKeys = {};
	pubComDisp.commentsByDateVis = {name: 'byDate', children:[]};
	pubComDisp.commentsByTopicVis = {name: 'byTopic', children:[]};
	pubComDisp.refreshVisualization = 0;
	//
	// Get Project
	Project.getProject({id: $stateParams.id}).then(function(res) {
		pubComDisp.project = res.data;

		pubComDisp.bucketGroups = _.unique(_.pluck(pubComDisp.project.buckets, 'group'));

		// get public comments and sort into date groups.
		Project.getPublicCommentsPublished(res.data._id).then(function(res) {
			pubComDisp.comments = res.data;

			var dateCount = {};
			var dateTitle = '';
			var dateTitleNoSort = '';

			// separate the comments for bubble visualization
			_.each(pubComDisp.comments, function(item) {

				if(!pubComDisp.commentsByDate) pubComDisp.commentsByDate = {};

				// get the comment date in a month and day to sort into headings
				dateTitle = moment(item.dateAdded).format("YYYYMMDD-MMM Do");
				dateTitleNoSort = moment(item.dateAdded).format("MMM Do");

				// if this heading doens't exist, create it.
				if (!dateCount[dateTitleNoSort]) dateCount[dateTitleNoSort] = 0;
				dateCount[dateTitleNoSort]++;

				// add the comment to a date list for display.
				if (!pubComDisp.commentsByDate[dateTitle]) pubComDisp.commentsByDate[dateTitle] = [];
				pubComDisp.commentsByDateKeys.push(dateTitle);
				pubComDisp.commentsByDate[dateTitle].push(item);

				// add the comment to a bucket list for display.
				_.each(item.buckets, function(bucket) {
					if( bucket.name ) {
						if (!pubComDisp.commentsByTopic) pubComDisp.commentsByTopic = {};
						if (!pubComDisp.commentsByTopic[bucket.name]) pubComDisp.commentsByTopic[bucket.name] = [];
						pubComDisp.commentsByTopic[bucket.name].push(item);

						// make a structure of keys to filter on key meta.
						if (!pubComDisp.commentsByTopicKeys[bucket.name]) pubComDisp.commentsByTopicKeys[bucket.name] = {name:bucket.name, group:bucket.group};

						// is the bucket already in the visualization?
						var findBucket = _.find(pubComDisp.commentsByTopicVis.children, function(o) {
							return o.name === bucket.name;
						});

						if (!findBucket) {
							pubComDisp.commentsByTopicVis.children.push({name: bucket.name, size: 1});
						} else {
							findBucket.size++;
						}

					}
				});
			});

			pubComDisp.commentsByDateKeys = _.unique(pubComDisp.commentsByDateKeys);

			_.each(dateCount, function(num, key) {
				pubComDisp.commentsByDateVis.children.push({'name': key, 'size': num});
			});

			if (Object.keys(pubComDisp.commentsByDateVis.children).length < 14) {
				pubComDisp.commentsByDateVis = null;
			}

			if (Object.keys(pubComDisp.commentsByTopicVis.children).length < 30) {
				pubComDisp.commentsByTopicVis = null;
			}

			// trigger the d3 to draw.
			if (pubComDisp.comments.length > 0) {
				pubComDisp.refreshVisualization = 1;
			}

		});

	});
}



