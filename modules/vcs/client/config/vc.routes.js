'use strict';
// =========================================================================
//
// vc routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', '_', function ($stateProvider, _) {
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
			},
			canSeeInternalDocuments: function (UserModel, project) {
				return UserModel.canSeeInternalDocuments(project);
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
		controller: function ($scope, NgTableParams, vcs, project, $modal, $state, Authentication) {
			// EPIC-745 Sort by Name [alpha], then by Title [alpha] inside the name
			var sortedVcs = _.sortByOrder(vcs, ['name', 'title']);
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: sortedVcs});
			$scope.project = project;
			$scope.authentication = Authentication;
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
			},
			canDeleteVc: function($stateParams, VcModel, vc) {
				return VcModel.deleteCheck (vc._id);
			}
		},
		controller: function ($scope, $state, vc, canDeleteVc, project, VcModel, PILLARS, TopicModel, art, ArtifactModel, _, vclist, vcs, VCTYPES, $modal, canSeeInternalDocuments) {
			// console.log ('vc = ', vc);
			$scope.vc = vc;

			$scope.canPublish = vc.userCan.publish && !vc.isPublished;
			$scope.canUnpublish = vc.userCan.unPublish && vc.isPublished;
			// disable the delete button if user doesn't have permission to delete, or the vc is published, or it has related data...
			$scope.canDelete = vc.userCan.delete && !vc.isPublished && canDeleteVc.canDelete;

			$scope.vclist = _.sortByOrder(vclist, "name", "asc");
			$scope.vcs = vcs;
			$scope.vc.artifact = art;
			$scope.vc.artifact.document = ($scope.vc.artifact.document) ? $scope.vc.artifact.document : {};
			$scope.vc.artifact.maindocument = $scope.vc.artifact.document._id ? [$scope.vc.artifact.document._id] : [];
			$scope.vc.artifact.canSeeInternalDocuments = canSeeInternalDocuments;
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

			$scope.originalData = JSON.stringify($scope.vc); // used to capture unsaved changes when we leave this route/screen
			$scope.allowTransition = false;

			var $locationChangeStartUnbind = $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
				if ($scope.originalData !== JSON.stringify($scope.vc) && !$scope.allowTransition) {
					// something changed...
					// do NOT allow the state change yet.
					event.preventDefault();

					$modal.open({
						animation: true,
						templateUrl: 'modules/vcs/client/views/vc-modal-confirm-cancel.html',
						controller: function($scope, $state, $modalInstance) {
							var self = this;
							self.ok = function() {
								$modalInstance.close();
							};
							self.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
						},
						controllerAs: 'self',
						scope: $scope
					}).result.then(function (res) {
						$scope.allowTransition = true;
						$state.go(toState);
					}, function (err) {
						// cancelled...
					});

				} else {
					//DO NOTHING THERE IS NO CHANGES IN THE FORM
					//console.log('data NOT changed, let my data go!');
				}

			});

			$scope.$on('$destroy', function () {
				window.onbeforeunload = null;
				$locationChangeStartUnbind();
			});

			var goToList = function() {
				$state.transitionTo('p.vc.list', {projectid: $scope.project.code}, {
					reload: true, inherit: false, notify: true
				});
			};

			var reloadEdit = function() {
				// want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
				$scope.allowTransition = true;
				$state.reload();
			};

			$scope.showError = function(msg, errorList, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/vcs/client/views/vc-modal-error.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.vc = $scope.vc;
						self.title = title || 'An error has occurred';
						self.msg = msg;
						self.errors = errorList;
						self.ok = function() {
							$modalInstance.close(vc);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});
				// do not care how this modal is closed, just go to the desired location...
				modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
			};

			$scope.showSuccess = function(msg, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/vcs/client/views/vc-modal-success.html',
					controller: function($scope, $state, $modalInstance, _) {
						var self = this;
						self.vc = $scope.vc;
						self.title = title || 'Success';
						self.msg = msg;
						self.ok = function() {
							$modalInstance.close(vc);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});
				// do not care how this modal is closed, just go to the desired location...
				modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
			};

			$scope.delete = function() {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/vcs/client/views/vc-modal-confirm-delete.html',
					controller: function($scope, $state, $modalInstance, VcModel, _) {
						var self = this;
						self.vc = $scope.vc;
						self.ok = function() {
							$modalInstance.close(vc);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md'
				});
				modalDocView.result.then(function (res) {
					VcModel.deleteId($scope.vc._id)
						.then(function(res) {
							// deleted show the message, and go to list...
							$scope.showSuccess('"'+ $scope.vc.name +'"' + ' was deleted successfully from this project.', goToList, 'Delete Success');
						})
						.catch(function(res) {
							// could have errors from a delete check...
							var failure = _.has(res, 'message') ? res.message : undefined;
							if (failure) {
								var errorList = [];
								if (failure.comments && failure.comments.length > 0) {
									errorList.push({msg: 'Has ' + failure.comments.length + ' related comments.'});
								}
								if (failure.artifacts && failure.artifacts.length > 0) {
									errorList.push({msg: 'Has ' + failure.artifacts.length + ' related Content.'});
								}
								if (failure.vcs && failure.vcs.length > 0) {
									errorList.push({msg: 'Has ' + failure.vcs.length + ' related Valued Components.'});
								}
								$scope.showError('"'+ $scope.vc.name +'"' + ' cannot be deleted.', errorList, reloadEdit, 'Delete Error');
							} else {
								$scope.showError('"'+ $scope.vc.name +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
							}
						});
				}, function () {
					//console.log('delete modalDocView error');
				});
			};

			$scope.publish = function() {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/vcs/client/views/vc-modal-confirm-publish.html',
					controller: function($scope, $state, $modalInstance, VcModel, _) {
						var self = this;
						self.vc = $scope.vc;
						self.ok = function() {
							$modalInstance.close(vc);
						};
						self.cancel = function() {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md'
				});
				modalDocView.result.then(function (res) {
					vc.artifact.document = vc.artifact.maindocument[0];
					if (_.isEmpty (vc.artifact.document)) vc.artifact.document = null;
					ArtifactModel.save($scope.vc.artifact)
					.then (function () {
						return VcModel.save ($scope.vc);
					})
					.then (function (vc) {
						return VcModel.publish ($scope.vc._id);
					})
					.then(function (res) {
						$scope.showSuccess('"'+ $scope.vc.name +'"' + ' was published successfully', reloadEdit, 'Publish Success');
					})
					.catch(function(res) {
						$scope.showError('"'+ $scope.vc.name +'"' + ' was not published.', [], reloadEdit, 'Delete Error');
					});
				}, function () {
					//console.log('publish modalDocView error');
				});
			};

			$scope.unpublish = function() {
				VcModel.unpublish ($scope.vc._id)
					.then(function(res) {
						$scope.showSuccess('"'+ $scope.vc.name +'"' + ' was unpublished successfully', reloadEdit, 'Unpublish Successful');
					})
					.catch(function(res) {
						$scope.showError('"'+ $scope.vc.name +'"' + ' is still published.', [], reloadEdit, 'An Error has occurred');
					});
				};

			$scope.save = function (isValid) {
				console.log("vc edit save", isValid);
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'vcAddForm');
					return false;
				}


				vc.artifact.document = vc.artifact.maindocument[0];
				if (_.isEmpty (vc.artifact.document)) vc.artifact.document = null;
				ArtifactModel.save($scope.vc.artifact)
				.then (function () {
					return VcModel.save ($scope.vc);
				})
				.then (function (res) {
					$scope.showSuccess('"'+ $scope.vc.name +'"' + ' was saved successfully', reloadEdit, 'Save Successful');
				})
				.catch (function (err) {
					$scope.showError('"'+ $scope.vc.name +'"' + ' was not saved.', [], reloadEdit, 'Save Error');
				});
			};

			$scope.$on('cleanup', function () {
				// This happens when someone uploads a document and associates it to this VC Artifact through the link document
				// UI.  Formerly, it would want to close the scope without saving changes.  This way we can retain the current
				// edits, and allow the other elements in the vc to stay there, and reset upon cancellation.  The problem is
				// that uploads save the artifact immediately upon upload, and there's no 'cancelling' of this.  So if they
				// only upload and then hit cancel, it currently will not de-associate the linked document from the artifact.
				// This is because of the business desire to force uploads into an artifact automatically and persist the
				// change to the DB immediately.  Perhaps a better workaround would be to either special case VC uploads so they
				// don't persist immediately, or remove the requirement to force uploads into an Artifact globally.
				ArtifactModel.lookup($scope.vc.artifact._id)
				.then( function (art) {
					$scope.vc.artifact = art;
					$scope.vc.artifact.document = ($scope.vc.artifact.document) ? $scope.vc.artifact.document : {};
					$scope.vc.artifact.maindocument = $scope.vc.artifact.document._id ? [$scope.vc.artifact.document._id] : [];
					$scope.$apply();
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
		controller: function ($scope, _, vc, project, art, vclist, canSeeInternalDocuments) {
			// console.log ('vc = ', vc);
			$scope.vc = vc;
			$scope.vclist = _.sortByOrder(vclist, "name", "asc");
			$scope.vc.artifact = art;
			$scope.project = project;
			$scope.vc.artifact.document = ($scope.vc.artifact.document) ? $scope.vc.artifact.document : {};
			$scope.vc.artifact.maindocument = $scope.vc.artifact.document._id ? [$scope.vc.artifact.document._id] : [];
			$scope.vc.artifact.canSeeInternalDocuments = canSeeInternalDocuments;
		}
	})

	;

}]);

