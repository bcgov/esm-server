'use strict';
// =========================================================================
//
// complaint routes
//
// =========================================================================
angular.module('complaints').config(['$stateProvider', 'RELEASE', function ($stateProvider, RELEASE) {
	if (RELEASE.enableComplaints) {
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
					return ComplaintModel.forProject (project._id);
				},
				vcs: function(VcModel, project) {
					return VcModel.forProject(project._id);
				}
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
			templateUrl: 'modules/project-complaints/client/views/complaint-list.html',
			controller: function ($scope, NgTableParams, complaints, vcs, project, CE_STAGES) {
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: complaints});
				$scope.project = project;
				$scope.stages = CE_STAGES;
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
			templateUrl: 'modules/project-complaints/client/views/complaint-edit.html',
			resolve: {
				complaint: function (ComplaintModel) {
					return ComplaintModel.getNew ();
				}
			},
			controller: function ($scope, $state, project, complaint, vcs, ComplaintModel, CE_STAGES) {
				$scope.complaint = complaint;
				$scope.complaint.project = project._id;
				$scope.project = project;
				$scope.stages = CE_STAGES;
				$scope.save = function (isValid) {
					if (!isValid) {
						$scope.$broadcast('show-errors-check-validity', 'complaintForm');
						return false;
					}
					ComplaintModel.add ($scope.complaint)
					.then (function (model) {
						$state.transitionTo('p.complaint.list', {projectid:project.code}, {
				  			reload: true, inherit: false, notify: true
						});
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
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
			templateUrl: 'modules/project-complaints/client/views/complaint-edit.html',
			resolve: {
				complaint: function ($stateParams, ComplaintModel) {
					return ComplaintModel.getModel ($stateParams.complaintId);
				}
			},
			controller: function ($scope, $state, complaint, project, vcs, ComplaintModel, CE_STAGES) {
				$scope.complaint = complaint;
				$scope.project = project;
				$scope.stages = CE_STAGES;
				$scope.vcs = vcs;

				$scope.save = function (isValid) {
					if (!isValid) {
						$scope.$broadcast('show-errors-check-validity', 'complaintForm');
						return false;
					}
					ComplaintModel.save ($scope.complaint)
					.then (function (model) {
						// console.log ('complaint was saved',model);
						// console.log ('now going to reload state');
						$state.transitionTo('p.complaint.list', {projectid:project.code}, {
				  			reload: true, inherit: false, notify: true
						});
					})
					.catch (function (err) {
						console.error (err);
						// alert (err.message);
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
			templateUrl: 'modules/project-complaints/client/views/complaint-view.html',
			resolve: {
				complaint: function ($stateParams, ComplaintModel) {
					return ComplaintModel.getModel ($stateParams.complaintId);
				}
			},
			controller: function ($scope, complaint, project) {
				$scope.complaint = complaint;
				$scope.project = project;
			}
		});
}
}]);

