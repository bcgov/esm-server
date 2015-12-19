'use strict';

angular.module('tasks')
	.controller('controllerTaskPublicCommentClassificationProponent', controllerTaskPublicCommentClassificationProponent)
	.filter ('filterClassifyComments', filterClassifyComments)
	.filter ('filterClassifyValueComponents', filterClassifyValueComponents)
	.filter ('filterClassifyIssues', filterClassifyIssues);
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Task for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerTaskPublicCommentClassificationProponent.$inject = ['$scope', '$rootScope'];
	//
function controllerTaskPublicCommentClassificationProponent($scope, $rootScope) {
	var taskPubComClassProp = this;

	// these hold the default list from the project.
	// they should not be modified after initial load.
	taskPubComClassProp.buckets = [];
	taskPubComClassProp.issues = [];

	// in each cateogry allow an active index.  Only one of these can be seen at a time.
	// compare the active index and the proponent status to see which record is active or not.
	// unclassified will always be 0.
	taskPubComClassProp.activeCommentId = null;

	taskPubComClassProp.filterScopeComment = false;
	taskPubComClassProp.filterScopeValueComponents = true;
	taskPubComClassProp.filterScopeIssues = true;		

	var i=0;

	taskPubComClassProp.sampleData = function(id) {
		return {
			_id: id,
			comment: "Public comment " + id + ".<br/><br/>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eget elementum mauris.<br/><br/>Nulla euismod, nisi eu dapibus dictum, enim tortor ornare lectus, vitae aliquet erat mauris vel massa. Praesent quam eros, condimentum ac nisl nec, vulputate hendrerit lorem.<br/></br>Morbi magna nisl, elementum ac tortor in, venenatis finibus ex. Vivamus congue ex sit amet interdum aliquam. Mauris cursus nunc leo, ut imperdiet diam iaculis id. Mauris et suscipit erat, ac efficitur nisi. Pellentesque interdum aliquet enim ut scelerisque. Sed laoreet magna non elementum mollis. Vestibulum iaculis commodo turpis. Duis sapien odio, rutrum at ipsum ut, porttitor tincidunt nunc.  Donec felis ipsum, porta vitae consequat ac, gravida in nibh. Aenean molestie, sem vel sodales eleifend, dolor sapien volutpat dolor, id porttitor leo felis vel est. Curabitur pulvinar, ligula vel placerat imperdiet, lorem erat vestibulum massa, id egestas urna leo eu justo. Sed lacus sem, placerat quis justo vitae, imperdiet placerat dui. Donec eget nibh lacinia, ultricies lectus a, scelerisque eros. Maecenas justo dui, lacinia vel dolor sed, bibendum elementum lectus. Sed ac elit ac eros rutrum tempor at quis risus.<br/><br/>Maecenas in urna massa. Duis a est dictum lacus volutpat egestas eu luctus mauris. Duis vitae ante convallis, vehicula lorem ac, condimentum velit. Donec luctus, risus a ornare feugiat, ligula leo porta ligula, vitae pharetra massa erat a sem. Ut quis metus quam.",
			author: "Some Author",
			dateAdded: Date(),
			original: null,
			eaoStatus: "Unclassified",
			eaoNotes: "",
			overallStatus: "Unclassified",
			proponentStatus: "Unclassified",
			proponentNotes: '',
			buckets: [],
			issues: [],
			documents: [
				{
					_id:1234,
					name: "document 1",
					url: "http://here/url",
					status: "pending"
				}
			]
		};
	};

	// when a new comment is loaded, set the id to active.
	// if an old comment is clicked, set the active id to the selected item so the edit will show.



	taskPubComClassProp.data = {comments: [angular.copy(taskPubComClassProp.sampleData(++i))]};
	taskPubComClassProp.activeCommentId = i;


	taskPubComClassProp.deferCommentStatus = function(com) {
		// todo: validation
		com.overallStatus = com.proponentStatus = 'Deferred';
		taskPubComClassProp.fetchNewComment();
	};

	taskPubComClassProp.finalizeCommentStatus = function(com) {
		// all documents and comment must have a status of not pending.
		if (com.buckets.length > 0 || com.issues.length > 0) {
			com.overallStatus = com.proponentStatus = 'Classified';
			taskPubComClassProp.fetchNewComment();
		} else {
			window.alert("Please indicate which value components and / or issues this comment is related to before continuing.");
		}
	};


	taskPubComClassProp.fetchNewComment = function() {
		taskPubComClassProp.filter = 'Unclassified';

		var newComment = angular.copy(taskPubComClassProp.sampleData(++i));
		taskPubComClassProp.data.comments.push(newComment);
		taskPubComClassProp.activeCommentId = i;

		taskPubComClassProp.refreshBucketSource(newComment);
	};

	// refresh the bucket list by getting the project buckets.
	taskPubComClassProp.refreshBucketSource = function(com) {
		taskPubComClassProp.buckets = [];
		_.each( taskPubComClassProp.project.buckets, function(obj) {
			console.log('add bucket', obj.name, !_.some(com.buckets, _.matchesProperty('code', obj.code)));
			if (!_.some(com.buckets, _.matchesProperty('code', obj.code))) {
				taskPubComClassProp.buckets.push(obj);
			}	
		});
	};
	
	// add a bucket to a comment by pushing it to the local list.
	taskPubComClassProp.addBucketToSelection = function(com, bucket) {
		if(!com.buckets) com.buckets = [];
		com.buckets.push(bucket);

		taskPubComClassProp.refreshBucketSource(com);
	};


	taskPubComClassProp.activateComment = function(com) {
		taskPubComClassProp.activeCommentId = com._id;
		taskPubComClassProp.refreshBucketSource(com);
	};

	// remove a bucket from the comment by removing it from the comment
	taskPubComClassProp.removeBucketFromSelection = function(com, bucket) {
		_.remove(com.buckets, bucket);
		taskPubComClassProp.refreshBucketSource(com);
	};

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

	// get the project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskPubComClassProp.project = newValue;
			taskPubComClassProp.buckets = angular.copy(newValue.buckets);
			console.log('class project', newValue.data);
			if(newValue.data) {
				taskPubComClassProp.data.comments = newValue.data.comments;
				console.log('newvalue project', taskPubComClassProp.data.comments);
			}
			

			
		}
	});

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
	}
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
	}
}
// -----------------------------------------------------------------------------------
//
// FILTER: Filter Value Components
//
// -----------------------------------------------------------------------------------
filterClassifyIssues.$inject = ['$filter'];
//
function filterClassifyIssues($filter) {
	return function(items, enable, keywords) {
    	if (enable) {
    		return $filter('filter')(items, keywords);
    	} else {
    		return items;
    	}
	}
}