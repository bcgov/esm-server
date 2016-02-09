'use strict';

angular.module('process')
	.controller('controllerProcessManageComments', controllerProcessManageComments)
	.controller('controllerProcessModalCommentDetail', controllerProcessModalCommentDetail);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process for Simple Complete
//
// -----------------------------------------------------------------------------------
controllerProcessManageComments.$inject = ['$scope', '$rootScope', 'Process', '_', 'sProcessManageComments', 'Authentication'];
	//
function controllerProcessManageComments($scope, $rootScope, Process, _, sProcessManageComments, Authentication) {

	var taskManComm = this;

	taskManComm.comments = [];


	taskManComm.setEaoStatusFilter = function(newValue) {
		if (newValue === taskManComm.eaoStatusFilter) {
			taskManComm.eaoStatusFilter = undefined;
		} else {
			taskManComm.eaoStatusFilter = newValue;
		}
	};



	taskManComm.setProponentStatusFilter = function(newValue) {
		if (newValue === taskManComm.proponentStatusFilter) {
			taskManComm.proponentStatusFilter = undefined;
		} else {
			taskManComm.proponentStatusFilter = newValue;
		}
	};


	taskManComm.setOverallStatusFilter = function(newValue) {
		if (newValue === taskManComm.overallStatusFilter) {
			taskManComm.overallStatusFilter = undefined;
		} else {
			taskManComm.overallStatusFilter = newValue;
		}
	};



	// watch project
	$scope.$watch('project', function(newValue) {
		if (newValue) {
			taskManComm.project = newValue;
			//
			// get the bucket groups for general classification
			taskManComm.bucketGroups = _.unique(_.pluck(taskManComm.project.buckets, 'group'));
			taskManComm.topicsList = _.unique(_.pluck(taskManComm.project.buckets, 'name'));
			console.log('tl',taskManComm.topicsList);
			taskManComm.bucketsFiltered = taskManComm.project.buckets;
			//
			//
			// make a copy so changes aren't bound to the underlying screens.
			sProcessManageComments.getAllPublishedComments(newValue._id).then( function(res) {
				_.each(res.data, function(item) {
					taskManComm.comments.push(item);
				});

				if (_.contains(Authentication.user.roles, 'admin')) {
					sProcessManageComments.getAllUnpublishedComments(newValue._id).then( function(res) {
						_.each(res.data, function(item) {
							taskManComm.comments.push(item);
						});
					});
				}
			});
		}
	});

	$scope.$watch('anchor', function(newValue) {
		if (newValue) {
			taskManComm.taskAnchor = newValue;
		}
	});


	$scope.$watch('task', function(newValue) {
		// get item for title
		if (newValue) {
			taskManComm.taskId = newValue._id;
			taskManComm.task = newValue;
		}
	});


	taskManComm.panelSort = [
		{'field': 'dateAdded', 'name':'Date'},
		{'field': 'overallStatus', 'name':'Overall Status'},
		{'field': 'eaoStatus', 'name':'EAO Status'},
		{'field': 'proponentStatus', 'name':'Proponent Status'}
	];




	// taskNotification.completeProcess = function() {
	// 	// validate
	// 	// when ok, broadcast
	// 	taskManComm.item.value = 'Complete';
	// 	$rootScope.$broadcast('resolveItem', {item: taskManageComments.itemId});
	// }
	
}   
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Process Comment Detail Modal
//
// -----------------------------------------------------------------------------------
controllerProcessModalCommentDetail.$inject = ['$scope', '$modalInstance', 'rComment', 'rProject', '_'];
	//
function controllerProcessModalCommentDetail($scope, $modalInstance, rComment, rProject, _) {
	var taskComDetail = this;

	taskComDetail.bucketGroups = _.unique(_.pluck(rProject.buckets, 'group'));

	taskComDetail.comment = rComment;
	taskComDetail.project = rProject;

	taskComDetail.cancel = function() {
		$modalInstance.dismiss();
	};

}
