'use strict';
// =========================================================================
//
// complaint routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for complaints.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the list of complaints for this project, which will
	// also become available to child states as 'complaints'
	//
	// -------------------------------------------------------------------------
	.state('p.complaint', {
		abstract:true,
		url: '/complaint',
		template: '<ui-view></ui-view>',
		resolve: {
			complaints: function ($stateParams, ComplaintModel, project) {
				console.log ('complaint abstract resolving complaints');
				console.log ('project id = ', project._id);
				return ComplaintModel.getComplaintsForProject (project._id);
			},
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for complaints and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.complaint.list', {
		url: '/list',
		templateUrl: 'modules/complaints/client/views/complaint-list.html',
		controller: function ($scope, NgTableParams, complaints, project) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: complaints});
			$scope.project = project;
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('p.complaint.create', {
		url: '/create',
		templateUrl: 'modules/complaints/client/views/complaint-edit.html',
		resolve: {
			complaint: function (ComplaintModel) {
				return ComplaintModel.getNew ();
			}
		},
		controller: function ($scope, $state, project, complaint, ComplaintModel) {
			$scope.complaint = complaint;
			$scope.project = project;
			$scope.save = function () {
				ComplaintModel.add ($scope.complaint)
				.then (function (model) {
					$state.transitionTo('p.complaint.list', {project:project._id}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the edit state
	//
	// -------------------------------------------------------------------------
	.state('p.complaint.edit', {
		url: '/:complaintId/edit',
		templateUrl: 'modules/complaints/client/views/complaint-edit.html',
		resolve: {
			complaint: function ($stateParams, ComplaintModel) {
				console.log ('editing complaintId = ', $stateParams.complaintId);
				return ComplaintModel.getModel ($stateParams.complaintId);
			}
		},
		controller: function ($scope, $state, complaint, project, ComplaintModel) {
			console.log ('complaint = ', complaint);
			$scope.complaint = complaint;
			$scope.project = project;
			$scope.save = function () {
				ComplaintModel.save ($scope.complaint)
				.then (function (model) {
					console.log ('complaint was saved',model);
					console.log ('now going to reload state');
					$state.transitionTo('p.complaint.list', {project:project._id}, {
			  			reload: true, inherit: false, notify: true
					});
				})
				.catch (function (err) {
					console.error (err);
					alert (err);
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the 'view' mode of a complaint. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.complaint.detail', {
		url: '/:complaintId',
		templateUrl: 'modules/complaints/client/views/complaint-view.html',
		resolve: {
			complaint: function ($stateParams, ComplaintModel) {
				console.log ('complaintId = ', $stateParams.complaintId);
				return ComplaintModel.getModel ($stateParams.complaintId);
			}
		},
		controller: function ($scope, complaint, project) {
			console.log ('complaint = ', complaint);
			$scope.complaint = complaint;
			$scope.project = project;
		}
	})

	;

}]);

