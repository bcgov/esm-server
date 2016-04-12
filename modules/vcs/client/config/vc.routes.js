'use strict';
// =========================================================================
//
// vc routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for vcs.
	// since it is a child of p (project), the project injection has already
	// been resolved and is available to subsequent child states as 'project'
	// here we will resolve the list of vcs for this project, which will
	// also become available to child states as 'vcs'
	//
	// -------------------------------------------------------------------------
	.state('p.vc', {
		abstract:true,
		url: '/vc',
		template: '<ui-view></ui-view>',
		resolve: {
			vcs: function ($stateParams, VcModel, project) {
				// console.log ('vc abstract resolving vcs');
				// console.log ('project id = ', project._id);
				return VcModel.forProject (project._id);
			},
		},
        onEnter: function (MenuControl, project) {
            MenuControl.routeAccess (project.code, 'any','edit-vcs');
        }
	})
	// -------------------------------------------------------------------------
	//
	// the list state for vcs and project are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('p.vc.list', {
		url: '/list',
		templateUrl: 'modules/vcs/client/views/vc-list.html',
		controller: function ($scope, NgTableParams, vcs, project, $modal, $state) {
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: vcs});
			$scope.project = project;

			$scope.openAddTopic = function() {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/topics/client/views/topic-modal-select.html',
					controller: 'controllerAddTopicModal',
					controllerAs: 'self',
					scope: $scope,
					size: 'lg'
				});
				modalDocView.result.then(function (res) {
					// console.log("res",res);
					$state.transitionTo('p.vc.list', {projectid:project.code}, {
			  			reload: true, inherit: false, notify: true
					});
				}, function () {
					//console.log("err");
				});
			};
		}
	})
	// -------------------------------------------------------------------------
	//
	// this is the add, or create state. it is defined before the others so that
	// it does not conflict
	//
	// -------------------------------------------------------------------------
	.state('p.vc.create', {
		url: '/create',
		templateUrl: 'modules/vcs/client/views/vc-edit.html',
		resolve: {
			vc: function (VcModel) {
				return VcModel.getNew ();
			}
		},
		controller: function ($scope, $state, project, vc, VcModel) {
			$scope.vc = vc;
			$scope.project = project;
			$scope.save = function () {
				VcModel.add ($scope.vc)
				.then (function (model) {
					$state.transitionTo('p.vc.list', {projectid:project.code}, {
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
	.state('p.vc.edit', {
		url: '/:vcId/edit',
		templateUrl: 'modules/vcs/client/views/vc-edit.html',
		resolve: {
			vc: function ($stateParams, VcModel) {
				// console.log ('editing vcId = ', $stateParams.vcId);
				return VcModel.getModel ($stateParams.vcId);
			}
		},
		controller: function ($scope, $state, vc, project, VcModel) {
			// console.log ('vc = ', vc);
			$scope.vc = vc;
			$scope.project = project;
			$scope.save = function () {
				VcModel.save ($scope.vc)
				.then (function (model) {
					// console.log ('vc was saved',model);
					// console.log ('now going to reload state');
					$state.transitionTo('p.vc.list', {projectid:project.code}, {
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
	// this is the 'view' mode of a vc. here we are just simply
	// looking at the information for this specific object
	//
	// -------------------------------------------------------------------------
	.state('p.vc.detail', {
		url: '/:vcId',
		templateUrl: 'modules/vcs/client/views/vc-view.html',
		resolve: {
			vc: function ($stateParams, VcModel) {
				// console.log ('vcId = ', $stateParams.vcId);
				return VcModel.getModel ($stateParams.vcId);
			}
		},
		controller: function ($scope, vc, project) {
			// console.log ('vc = ', vc);
			$scope.vc = vc;
			$scope.project = project;
		}
	})

	;

}]);

