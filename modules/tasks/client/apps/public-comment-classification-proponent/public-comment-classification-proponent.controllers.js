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
controllerTaskPublicCommentClassificationProponent.$inject = ['$scope', '$rootScope', '_', 'TaskPublicCommentClassificationProponent'];
	//
function controllerTaskPublicCommentClassificationProponent($scope, $rootScope, _, TaskPublicCommentClassificationProponent) {
	var taskPubComClassProp = this;

	// Keep track of the active comment for display of the edit controls.
	// Only one of these can be seen at a time.
	// All comparisons take place at the template level.
	taskPubComClassProp.activeComment = {};

	taskPubComClassProp.filterScopeComment = false;
	taskPubComClassProp.filterScopeValueComponents = true;
	taskPubComClassProp.filterScopeTopics = true;
	
	taskPubComClassProp.data = {comments: []};
	// -----------------------------------------------------------------------------------
	//
	// Get the current project
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComClassProp.project = newValue;

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
	taskPubComClassProp.finalizeCommentStatus = function(com) {
		// status change in progress
		if ((com.buckets && com.buckets.length > 0) || (com.topics && com.topics.length > 0) || (com.proponentNotes)) {
			// proceed with status change
			// must have buckets or topics or a reason why not.
			TaskPublicCommentClassificationProponent.setCommentClassify(com).then( function(res) {
				com = _.assign(com, res.data);

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
		// set the filter to show the unclassified one.
		taskPubComClassProp.filter = 'Unclassified';

		// detect if there is an unclassified comment in the array, if so, select it.
		taskPubComClassProp.activeComment = null;
		_.each(taskPubComClassProp.data.comments, function(comment) {
			if( comment.proponentStatus === 'Unclassified') {
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
				taskPubComClassProp.activeComment = res.data;
				console.log('CLASS: final', taskPubComClassProp.data.comments);
			});
		}
		// get the count of other pending comments.
		taskPubComClassProp.refreshPendingCount();
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
	// Refresh Footer Count
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.refreshPendingCount = function() {
		TaskPublicCommentClassificationProponent.getUnclassifiedCount(taskPubComClassProp.project._id).then( function(res) {
			taskPubComClassProp.unclassifiedCount = res.data.count;
		});
	};
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
//
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
//
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
//
function filterClassifyTopics($filter) {
	return function(items, enable, keywords) {
		if (enable) {
			return $filter('filter')(items, keywords);
		} else {
			return items;
		}
	};
}