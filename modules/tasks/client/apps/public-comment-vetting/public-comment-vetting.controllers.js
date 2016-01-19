'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentVetting', controllerTaskPublicCommentVetting);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentVetting.$inject = ['$scope', '$rootScope', '_', 'PublicCommentVetting'];
	//
function controllerTaskPublicCommentVetting($scope, $rootScope, _, PublicCommentVetting) {
	var taskPubComVet = this;

	taskPubComVet.data = {comments:[]};
	
	taskPubComVet.workingStatus = null;

	taskPubComVet.finalizeCommentStatus = function(com) {
		// all documents and comment must have a status of not pending.
		var pendingDocument = false;
		// status change in progress
		if (taskPubComVet.workingStatus) {
			// determine if any documents have yet to be vetted
			// if they have, update that status
			_.each(com.documents, function(doc) {
				if (doc.eaoStatus === 'Unvetted' || !doc.eaoStatus) {
					pendingDocument = true;
				} else if (doc.eaoStatus === 'Published') {
					PublicCommentVetting.setDocumentPublish(doc._id).then( function(res) {
						doc = _.assign(doc, res.data);
					});
				} else if (doc.eaoStatus === 'Deferred') {					
					PublicCommentVetting.setDocumentDefer(doc._id).then( function(res) {
						doc = _.assign(doc, res.data);
					});
				} else if (doc.eaoStatus === 'Rejected') {
					PublicCommentVetting.setDocumentReject(doc._id).then( function(res) {
						doc = _.assign(doc, res.data);
					});
				}
			});
			if (!pendingDocument) {
				// proceed with status change
				switch (taskPubComVet.workingStatus) {
					case 'Published':
						PublicCommentVetting.setCommentPublish(com._id).then( function(res) {
							com = _.assign(com, res.data);
							taskPubComVet.fetchNewComment();
						});
						break;
					case 'Deferred':
						PublicCommentVetting.setCommentDefer(com._id).then( function(res) {
							com = _.assign(com, res.data);
							taskPubComVet.fetchNewComment();
						});
						break;
					case 'Rejected':
						PublicCommentVetting.setCommentReject(com._id).then( function(res) {
							com = _.assign(com, res.data);
							taskPubComVet.fetchNewComment();
						});
						break;
					case 'Spam':
						PublicCommentVetting.setCommentSpam(com._id).then( function(res) {
							com = _.assign(com, res.data);
							taskPubComVet.fetchNewComment();
						});
						break;
				}
			} else {
				window.alert("Please review all documents before viewing the next comment.");
			}
		} else {
			window.alert("Please review the overall comment and all documents before viewing the next comment.");
		}
	};
	// -----------------------------------------------------------------------------------
	//
	// Set active record, used on the template
	//
	// -----------------------------------------------------------------------------------
	taskPubComVet.setActiveComment = function(comment) {
		taskPubComVet.activeComment = comment;
		taskPubComVet.workingStatus = comment.eaoStatus;
	};

	// -----------------------------------------------------------------------------------
	//
	// Get next comment
	//
	// -----------------------------------------------------------------------------------
	taskPubComVet.fetchNewComment = function() {
		taskPubComVet.workingStatus = null;
		taskPubComVet.activeComment = null;
		taskPubComVet.rejectWarning = null;

		// see if there's any more comments in this category, if so stay, otherwise go to unvetted and get a new one.
		_.each(taskPubComVet.data.comments, function(comment) {
			if ((comment.eaoStatus === taskPubComVet.filter) && !taskPubComVet.activeComment) {
				console.log(comment.eaoStatus, taskPubComVet.filter);
				taskPubComVet.activeComment = comment;
				taskPubComVet.workingStatus = comment.eaoStatus;
			}
		});

		// no other comment has been found so get another one.
		if (!taskPubComVet.activeComment) {
			PublicCommentVetting.getNextComment(taskPubComVet.project._id).then( function(res) {
				taskPubComVet.data.comments.push(res.data);
		 		taskPubComVet.filter = 'Unvetted';
				taskPubComVet.activeComment = res.data;
			});
		}

		// Get the comment counts.
		PublicCommentVetting.getUnvettedCount(taskPubComVet.project._id).then( function(res) {
			taskPubComVet.unvettedCount = res.data.count;
		});
	};

	// get the task identifier.  (ID + Task Type)
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComVet.project = newValue;

			// start the public commenting
			PublicCommentVetting.getStart(newValue._id).then( function(res) {
				// get all the comments
				taskPubComVet.data.comments = res.data;

				// set the filter to the desired tab
				taskPubComVet.filter = 'Unvetted';

				taskPubComVet.fetchNewComment();
			});

		}
	});

	// get the task identifier.  (ID + Task Type)
	$scope.$watch('anchor', function(newValue) {
		if (newValue) {	
			taskPubComVet.anchor = newValue;
		}
	});

	// get the spec item
	$scope.$watch('task', function(newValue) {
		// get item for title
		console.log('task', newValue);
		if (newValue) {
			taskPubComVet.taskId = newValue._id;
			taskPubComVet.task = newValue;
		}
	});

	taskPubComVet.completeTask = function() {
		// validate
		// when ok, broadcast
		console.log('complete', taskPubComVet.item);
		taskPubComVet.item.value = 'Complete';
		$rootScope.$broadcast('resolveItem', {itemId: taskPubComVet.itemId});
	};

}