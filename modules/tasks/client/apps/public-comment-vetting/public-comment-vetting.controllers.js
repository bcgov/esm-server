'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentVetting', controllerTaskPublicCommentVetting);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentVetting.$inject = ['$scope', '$rootScope', '$sce', '_'];
	//
function controllerTaskPublicCommentVetting($scope, $rootScope, $sce, _) {
	var taskPubComVet = this;

	taskPubComVet.data = {comments:[]};

	taskPubComVet.sampleComment = function(id) {
		return {
			_id: id,
			comment: "Public comment " + id + ".<br/><br/>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eget elementum mauris.<br/><br/>Nulla euismod, nisi eu dapibus dictum, enim tortor ornare lectus, vitae aliquet erat mauris vel massa. Praesent quam eros, condimentum ac nisl nec, vulputate hendrerit lorem.<br/></br>Morbi magna nisl, elementum ac tortor in, venenatis finibus ex. Vivamus congue ex sit amet interdum aliquam. Mauris cursus nunc leo, ut imperdiet diam iaculis id. Mauris et suscipit erat, ac efficitur nisi. Pellentesque interdum aliquet enim ut scelerisque. Sed laoreet magna non elementum mollis. Vestibulum iaculis commodo turpis. Duis sapien odio, rutrum at ipsum ut, porttitor tincidunt nunc.  Donec felis ipsum, porta vitae consequat ac, gravida in nibh. Aenean molestie, sem vel sodales eleifend, dolor sapien volutpat dolor, id porttitor leo felis vel est. Curabitur pulvinar, ligula vel placerat imperdiet, lorem erat vestibulum massa, id egestas urna leo eu justo. Sed lacus sem, placerat quis justo vitae, imperdiet placerat dui. Donec eget nibh lacinia, ultricies lectus a, scelerisque eros. Maecenas justo dui, lacinia vel dolor sed, bibendum elementum lectus. Sed ac elit ac eros rutrum tempor at quis risus.<br/><br/>Maecenas in urna massa. Duis a est dictum lacus volutpat egestas eu luctus mauris. Duis vitae ante convallis, vehicula lorem ac, condimentum velit. Donec luctus, risus a ornare feugiat, ligula leo porta ligula, vitae pharetra massa erat a sem. Ut quis metus quam.",
			author: "Optional Author Name",
			dateAdded: Date(),
			original: null,
			eaoStatus: "Unvetted",
			eaoNotes: "",
			overallStatus: "Unvetted",
			proponentStatus: "Unclassified",
			proponentNotes: '',
			buckets: [],
			issues: [],
			documents: [
				{
					_id:1234,
					name: "document 1",
					url: "http://here/url",
					status: "Unvetted"
				}
			]
		};
	};

	var i=0;

	taskPubComVet.data.comments.push(angular.copy(taskPubComVet.sampleComment(++i)));
	
	taskPubComVet.finalizeCommentStatus = function(com) {
		// all documents and comment must have a status of not pending.
		var pendingDocument = false;
		// status change in progress
		if (com.eaoStatus !== 'Unvetted') {
			// determine if any documents have yet to be vetted
			_.each(com.documents, function(doc) {
				if (doc.status === 'Unvetted' || !doc.status) {
					pendingDocument = true;
				}
			});
			if (!pendingDocument) {
				// proceed with status change
				com.overallStatus = com.eaoStatus;
				if (com.eaoStatus === 'Published') {
					taskPubComVet.project.data.comments.push(com);
				}
				taskPubComVet.fetchNewComment();
				// todo: make sure the handoff is correct to classification

			} else {
				window.alert("Please review all documents before viewing the next comment.");
			}
		} else {
			window.alert("Please review the overall comment and all documents before viewing the next comment.");
		}
	};


	taskPubComVet.fetchNewComment = function() {
		taskPubComVet.filter = 'Unvetted';

		var newComment = angular.copy(taskPubComVet.sampleComment(++i));
		taskPubComVet.data.comments.push(newComment);
		taskPubComVet.activeCommentId = i;
	};


	// get the task identifier.  (ID + Task Type)
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComVet.project = newValue;
			if (!taskPubComVet.project.data) {
				taskPubComVet.project.data = {comments:[]};
			}
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