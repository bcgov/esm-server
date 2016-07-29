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
			vcs: function ($stateParams, VcModel, ArtifactModel, project, ENV, _) {
				// console.log ('vc abstract resolving vcs');
				// console.log ('project id = ', project._id);
				// if (ENV === 'EAO')
				// 	// In EAO, they are artifacts - nothing for MEM right now so leave it.
				// 	return ArtifactModel.forProjectGetType (project._id, "valued-component");
				// else

				// This runs the populate for artifact, since it's been broken.
				return VcModel.forProject (project._id)
				.then( function (list) {
					_.each(list, function (item) {
						ArtifactModel.lookup(item.artifact)
						.then( function (art) {
							item.artifact = art;
						});
					});
					return list;
				});
			}
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
					templateUrl: 'modules/vcs/client/views/topic-modal-select.html',
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
				console.log ('editing vcId = ', $stateParams.vcId);
				return VcModel.getModel ($stateParams.vcId);
			},
			vcs: function ($stateParams, VcModel, vc) {
				// A list of all VC's for this project.
				return VcModel.forProject (vc.project);
			},
			art: function ($stateParams, ArtifactModel, vc) {
				return ArtifactModel.lookup(vc.artifact);
			},
			vclist: function ($stateParams, VcModel, vc) {
				// A list of already selected/added vc's
				return VcModel.getVCsInList(vc.subComponents);
			}
		},
		controller: function ($scope, $state, vc, project, VcModel, PILLARS, TopicModel, art, ArtifactModel, _, vclist, vcs, VCTYPES) {
			// console.log ('vc = ', vc);
			$scope.vc = vc;
			$scope.vclist = vclist;
			$scope.vcs = vcs;
			$scope.vc.artifact = art;
			$scope.vc.artifact.document = ($scope.vc.artifact.document) ? $scope.vc.artifact.document : {};
			$scope.vc.artifact.maindocument = $scope.vc.artifact.document._id ? [$scope.vc.artifact.document._id] : [];
			$scope.project = project;
			$scope.pillars = PILLARS;
			$scope.types = VCTYPES;
			$scope.selectTopic = function () {
				var self = this;
				TopicModel.getTopicsForPillar (this.vc.pillar).then (function (topics) {
					self.topics = topics;
					$scope.$apply();
				});
			};
			$scope.save = function () {
				vc.artifact.document = vc.artifact.maindocument[0];
				if (_.isEmpty (vc.artifact.document)) vc.artifact.document = null;
				ArtifactModel.save($scope.vc.artifact)
				.then (function () {
					return VcModel.save ($scope.vc);
				})
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
			$scope.$on('cleanup', function () {
				$state.go('p.vc.detail', {
						projectid:$scope.project.code,
						vcId: $scope.vc._id
					}, {
					reload: true, inherit: false, notify: true
				});
			});
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
			},
			art: function ($stateParams, ArtifactModel, vc) {
				return ArtifactModel.lookup(vc.artifact);
			},
			vclist: function ($stateParams, VcModel, vc) {
				return VcModel.getVCsInList(vc.subComponents);
			}
		},
		controller: function ($scope, vc, project, art, vclist) {
			// console.log ('vc = ', vc);
			$scope.vc = vc;
			$scope.vclist = vclist;
			$scope.vc.artifact = art;
			$scope.project = project;
		}
	})

	;

}]);

