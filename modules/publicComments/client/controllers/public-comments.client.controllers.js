'use strict';

angular.module('publicComments')
	.controller('controllerClassifyPublicComment', controllerClassifyPublicComment);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerClassifyPublicComment.$inject = ['$scope', '$rootScope', '_', 'sPublicComments', '$filter'];
/* @ngInject */
function controllerClassifyPublicComment($scope, $rootScope, _, sPublicComments, $filter) {
	var pubComClass = this;

	// Keep track of the active comment for display of the edit controls.
	// Only one of these can be seen at a time.
	// All comparisons take place at the template level.
	pubComClass.filterScopeComment = false;
	pubComClass.filterScopeValueComponents = true;
	pubComClass.filterScopeTopics = true;

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
			$scope.$broadcast('classifyFetchNewComment');
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

			sPublicComments.setCommentClassify(pubComClass.com).then( function(res) {
			 	pubComClass.com = _.assign(pubComClass.com, res.data);

				// One has been classified, get another comment.
				$scope.$broadcast('classifyFetchNewComment');
			});

		} else {
			window.alert("Please select value components, topics before moving to the next comment or enter a reason for no validation.");
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Toggle the classifications (bucket groups)
	//
	// -----------------------------------------------------------------------------------
	pubComClass.toggleBucketGroup = function(group) {
		if (pubComClass.com.classification.indexOf(group) > -1) {
			_.remove(pubComClass.com.classification, function(item) { return item === group; });
		} else {
			pubComClass.com.classification.push(group);
		}

		pubComClass.filterBucketsByPillars();
	};


	// -----------------------------------------------------------------------------------
	//
	// Toggle the buckets (buckets)
	//
	// -----------------------------------------------------------------------------------
	pubComClass.toggleBucket = function(bucket) {
		if (pubComClass.com.buckets.indexOf(bucket) > -1) {
			_.remove(pubComClass.com.buckets, function(item) { return item === bucket; });
		} else {
			pubComClass.com.buckets.push(bucket);
		}
	};


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


	// select all groups
	pubComClass.selectAllGroups = function(selectAll) {
		if (selectAll) {
			pubComClass.com.classification = angular.copy(pubComClass.bucketGroups);
		} else {
			pubComClass.com.classification = [];
		}
		pubComClass.filterBucketsByPillars();
	};


	// select all topics
	pubComClass.selectAllTopics = function(selectAll) {
		if (selectAll) {
			_.each(pubComClass.bucketsFiltered, function(item) {
				pubComClass.com.buckets.push(item);
			});
		} else {
			pubComClass.com.buckets = [];
		}
	};


}