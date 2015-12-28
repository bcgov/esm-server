'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentClassificationProponent', controllerTaskPublicCommentClassificationProponent)
	.filter ('filterClassifyComments', filterClassifyComments)
	.filter ('filterClassifyValueComponents', filterClassifyValueComponents)
	.filter ('filterClassifytopics', filterClassifytopics);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentClassificationProponent.$inject = ['$scope', '$rootScope', '_', 'TaskPublicCommentClassificationProponent'];
	//
function controllerTaskPublicCommentClassificationProponent($scope, $rootScope, _, TaskPublicCommentClassificationProponent) {
	var taskPubComClassProp = this;

	// these hold the default list from the project.
	// they should not be modified after initial load.
	taskPubComClassProp.buckets = [];
	taskPubComClassProp.topics = [];

	// in each cateogry allow an active index.  Only one of these can be seen at a time.
	// compare the active index and the proponent status to see which record is active or not.
	// unclassified will always be 0.
	taskPubComClassProp.activeComment = {};

	taskPubComClassProp.filterScopeComment = false;
	taskPubComClassProp.filterScopeValueComponents = true;
	taskPubComClassProp.filterScopeTopics = true;		

	// when a new comment is loaded, set the id to active.
	// if an old comment is clicked, set the active id to the selected item so the edit will show.

	taskPubComClassProp.data = {comments: []};



	taskPubComClassProp.deferCommentStatus = function(com) {
		// todo: validation
		com.overallStatus = com.proponentStatus = 'Deferred';
		taskPubComClassProp.fetchNewComment();
	};
	//
	//
	// Classify and move on.
	//
	taskPubComClassProp.finalizeCommentStatus = function(com) {
		// status change in progress

		if ((com.buckets && com.buckets.length > 0) || (com.topics && com.topics.length > 0)) {
			// proceed with status change
			TaskPublicCommentClassificationProponent.setCommentClassify(com._id).then( function(res) {
				com = _.assign(com, res.data);
			});
			taskPubComClassProp.fetchNewComment();
		} else {
			window.alert("Please select value components or topics before moving to the next comment.");
		}
	};
	//
	//
	// Defer the comment
	//
	taskPubComClassProp.deferCommentStatus = function(com) {
		TaskPublicCommentClassificationProponent.setCommentDefer(com._id).then( function(res) {
			console.log('here', res.data);
			com = _.assign(com, res.data);
		});
	};


	// taskPubComClassProp.finalizeCommentStatus = function(com) {
	// 	// all documents and comment must have a status of not pending.
	// 	if (com.buckets.length > 0 || com.topics.length > 0) {
	// 		com.overallStatus = com.proponentStatus = 'Classified';
	// 		taskPubComClassProp.fetchNewComment();
	// 	} else {
	// 		window.alert("Please indicate which value components and / or topics this comment is related to before continuing.");
	// 	}
	// };


	// -----------------------------------------------------------------------------------
	//
	// Get next comment
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.fetchNewComment = function() {
		taskPubComClassProp.filter = 'Unclassified';

		TaskPublicCommentClassificationProponent.getNextComment(taskPubComClassProp.project._id).then( function(res) {
			taskPubComClassProp.data.comments.push(res.data);
			taskPubComClassProp.activeComment = res.data;

			taskPubComClassProp.refreshPendingCount();
		});
	};

	// refresh the bucket list by getting the project buckets.
	// taskPubComClassProp.refreshBucketSource = function(com) {
	// 	taskPubComClassProp.buckets = [];
	// 	_.each( taskPubComClassProp.project.buckets, function(obj) {
	// 		console.log('add bucket', obj.name, !_.some(com.buckets, _.matchesProperty('code', obj.code)));
	// 		if (!_.some(com.buckets, _.matchesProperty('code', obj.code))) {
	// 			taskPubComClassProp.buckets.push(obj);
	// 		}	
	// 	});
	// };
	


	// add a bucket to a comment by pushing it to the local list.
	// taskPubComClassProp.addBucketToSelection = function(com, bucket) {
	// 	if(!com.buckets) com.buckets = [];
	// 	com.buckets.push(bucket);

	// 	taskPubComClassProp.refreshBucketSource(com);
	// };


	// taskPubComClassProp.activateComment = function(com) {
	// 	taskPubComClassProp.activeCommentId = com._id;
	// 	taskPubComClassProp.refreshBucketSource(com);
	// };

	// // remove a bucket from the comment by removing it from the comment
	// taskPubComClassProp.removeBucketFromSelection = function(com, bucket) {
	// 	_.remove(com.buckets, bucket);
	// 	taskPubComClassProp.refreshBucketSource(com);
	// };

	// get the task identifier.  (ID + Task Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskPubComClassProp.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskPubComClassProp.taskId = newValue._id;
			taskPubComClassProp.task = newValue;
		}
	});


	// // get the project
	// $scope.$watch('project', function(newValue) {
	// 	if (newValue) {
	// 		taskPubComClassProp.project = newValue;
	// 		taskPubComClassProp.buckets = angular.copy(newValue.buckets);

	// 		if(newValue.data) {
	// 			taskPubComClassProp.data.comments = newValue.data.comments;
	// 			console.log('newvalue project', taskPubComClassProp.data.comments);
	// 		}
	// 	}
	// });


	// get the task identifier.  (ID + Task Type)
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComClassProp.project = newValue;
			taskPubComClassProp.buckets = angular.copy(newValue.buckets);

			// start the public commenting
			TaskPublicCommentClassificationProponent.getStart(newValue._id).then( function(res) {
				taskPubComClassProp.data.comments = res.data;

				var foundUnclassified = false;
				// if there is an unvetted record, don't pull any more unvetted ones
				_.each( res.data, function(comment) {
					console.log(comment.proponentStatus, comment);
					if (comment.proponentStatus === 'Unclassified') {
						foundUnclassified = true;
						// there is an unvetted record pending, make sure it's displayed
						taskPubComClassProp.activeComment = comment;
						taskPubComClassProp.filter = 'Unclassified';
					}
				});
				console.log(foundUnclassified);
				if (!foundUnclassified) {
					taskPubComClassProp.fetchNewComment();
				} else {
					taskPubComClassProp.refreshPendingCount();
				}
			});
		}
	});


	// -----------------------------------------------------------------------------------
	//
	// Refresh Footer Count
	//
	// -----------------------------------------------------------------------------------
	taskPubComClassProp.refreshPendingCount = function() {
		console.log('refreshcount');
		TaskPublicCommentClassificationProponent.getUnclassifiedCount(taskPubComClassProp.project._id).then( function(res) {
			console.log('count', res.data);
			taskPubComClassProp.unclassifiedCount = res.data.count;
		});
	};
	


	taskPubComClassProp.completeTask = function() {
		// validate
		// when ok, broadcast
		taskPubComClassProp.item.value = 'Complete';
		$rootScope.$broadcast('resolveItem', {itemId: taskPubComClassProp.itemId});
	};

}
// -----------------------------------------------------------------------------------
//
// FILTER: Filter comments
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
filterClassifytopics.$inject = ['$filter'];
//
function filterClassifytopics($filter) {
	return function(items, enable, keywords) {
    	if (enable) {
    		return $filter('filter')(items, keywords);
    	} else {
    		return items;
    	}
	};
}