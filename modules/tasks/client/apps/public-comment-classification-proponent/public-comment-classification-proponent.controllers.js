'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentClassificationProponent', controllerTaskPublicCommentClassificationProponent)
	.filter ('filterClassifyComments', filterClassifyComments)
	.filter ('filterClassifyValueComponents', filterClassifyValueComponents)
	.filter ('filterClassifyTopics', filterClassifyTopics);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentClassificationProponent.$inject = ['$scope', '$rootScope', '_', 'TaskPublicCommentClassificationProponent', '$filter'];
/* @ngInject */
function controllerTaskPublicCommentClassificationProponent($scope, $rootScope, _, TaskPublicCommentClassificationProponent, $filter) {
	var taskPubComClassProp = this;

	// Keep track of the active comment for display of the edit controls.
	// Only one of these can be seen at a time.
	// All comparisons take place at the template level.
	taskPubComClassProp.filterScopeComment = false;
	taskPubComClassProp.filterScopeValueComponents = true;
	taskPubComClassProp.filterScopeTopics = true;

	taskPubComClassProp.data = {comments: []};

	taskPubComClassProp.noClassificationPossible = false;
	// -----------------------------------------------------------------------------------
	//
	// Get the current project
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComClassProp.project = newValue;

			// get the bucket groups for general classification
			taskPubComClassProp.bucketGroups = _.unique(_.pluck(taskPubComClassProp.project.buckets, 'group'));
			taskPubComClassProp.bucketsFiltered = taskPubComClassProp.project.buckets;

			// GetStart will return all Deferred or Unclassified items for the current user.
			// fetch New Comment will make sure we don't fetch another comment if there already is one unclassified pending.
			TaskPublicCommentClassificationProponent.getStart(newValue._id).then( function(res) {
				taskPubComClassProp.data.comments = res.data;
				taskPubComClassProp.fetchNewComment();
			});
		}
	});
	// -----------------------------------------------------------------------------------
	//
	// Set Comment to Deferred and get another.
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.deferCommentStatus = function(comment) {
		TaskPublicCommentClassificationProponent.setCommentDefer(comment).then( function(res) {
			console.log('Deferred Comment Returned', res.data);
			comment = _.assign(comment, res.data);

			// One has been deferred, get another comment.
			taskPubComClassProp.fetchNewComment();
		});
	};
	// -----------------------------------------------------------------------------------
	//
	// Set Comment to Classified and get another.
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.finalizeCommentStatus = function(comment) {
		// status change in progress
		if ((comment.buckets && comment.buckets.length > 0) || (comment.topics && comment.topics.length > 0) || (comment.proponentNotes)) {
			// proceed with status change
			// must have buckets or topics or a reason why not.

			TaskPublicCommentClassificationProponent.setCommentClassify(comment).then( function(res) {
			 	comment = _.assign(comment, res.data);

				// One has been classified, get another comment.
				taskPubComClassProp.fetchNewComment();
			});

		} else {
			window.alert("Please select value components, topics before moving to the next comment or enter a reason for no validation.");
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Get next comment
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.fetchNewComment = function() {
		taskPubComClassProp.activeComment = null;

		// detect if there is an unclassified comment in the array, if so, select it.
		_.each(taskPubComClassProp.data.comments, function(comment) {
			if ((comment.proponentStatus === taskPubComClassProp.filter) && !taskPubComClassProp.activeComment) {
				taskPubComClassProp.activeComment = comment;
			}
		});

		console.log('CLASS: active', taskPubComClassProp.activeComment);

		// there's no found, unclassified so get a new record.
		if (!taskPubComClassProp.activeComment) {
			console.log('CLASS: no active found');
			TaskPublicCommentClassificationProponent.getNextComment(taskPubComClassProp.project._id).then( function(res) {
				console.log('CLASS: get new response', res);

				taskPubComClassProp.data.comments.push(res.data);
				taskPubComClassProp.filter = 'Unclassified';
				taskPubComClassProp.activeComment = res.data;
				taskPubComClassProp.noClassificationPossible = false;

				console.log('CLASS: final', taskPubComClassProp.data.comments);
			});
		}

		// get the count of other pending comments.
		TaskPublicCommentClassificationProponent.getUnclassifiedCount(taskPubComClassProp.project._id).then( function(res) {
			taskPubComClassProp.unclassifiedCount = res.data.count;
		});
	};
	// -----------------------------------------------------------------------------------
	//
	// Toggle the classifications (bucket groups)
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.toggleBucketGroup = function(comment, group) {
		if (comment.classification.indexOf(group) > -1) {
			_.remove(comment.classification, function(item) { return item === group; });
		} else {
			comment.classification.push(group);
		}

		// filter bucket list for new classifications
		taskPubComClassProp.bucketsFiltered = $filter('filter')(taskPubComClassProp.project.buckets, function(item) {
			return (comment.classification.indexOf(item.group) !== -1 );
		});

	};
	// -----------------------------------------------------------------------------------
	//
	// Get the Task data anchor string.  This is used to record instance data in the project.
	//
	// get the task identifier.  (ID + Task Type)
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskPubComClassProp.anchor = newValue;
		}
	});
	// -----------------------------------------------------------------------------------
	//
	// Get the Task Specification
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskPubComClassProp.taskId = newValue._id;
			taskPubComClassProp.task = newValue;
		}
	});
	// -----------------------------------------------------------------------------------
	//
	// Set task as complete.  Currently no UI to support.
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.completeTask = function() {
		// validate
		// when ok, broadcast
		taskPubComClassProp.item.value = 'Complete';
		$rootScope.$broadcast('resolveItem', {itemId: taskPubComClassProp.itemId});
	};

}
// -----------------------------------------------------------------------------------
//
// FILTER: Filter comments.  THESE FILTERS NEED TO BE FIGURED OUT BETTER.
//
// -----------------------------------------------------------------------------------
filterClassifyComments.$inject = ['$filter'];
/* @ngInject */
function filterClassifyComments($filter) {
	return function(items, enable, keywords) {
		if (enable) {
			return $filter('filter')(items, keywords);
		} else {
			return items;
		}
	};
}
// -----------------------------------------------------------------------------------
//
// FILTER: Filter Value Components
//
// -----------------------------------------------------------------------------------
filterClassifyValueComponents.$inject = ['$filter'];
/* @ngInject */
function filterClassifyValueComponents($filter) {
	return function(items, enable, keywords) {
		if (enable) {
			return $filter('filter')(items, keywords);
		} else {
			return items;
		}
	};
}
// -----------------------------------------------------------------------------------
//
// FILTER: Filter Value Components
//
// -----------------------------------------------------------------------------------
filterClassifyTopics.$inject = ['$filter'];
/* @ngInject */
function filterClassifyTopics($filter) {
	return function(items, enable, keywords) {
		if (enable) {
			return $filter('filter')(items, keywords);
		} else {
			return items;
		}
	};
}
