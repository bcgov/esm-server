'use strict';

angular.module('artifacts')

// -------------------------------------------------------------------------
//
// a template style directive with isolated scope for viewing and
// interacting with a list of artifacts
//
// -------------------------------------------------------------------------
.directive ('tmplArtifactList', function ($state, ArtifactModel) {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-list.html',
		scope: {
			project: '='
		},
		controller: function ($scope, NgTableParams, Authentication) {
			var s = this;
			s.public = (!Authentication.user);
			this.selectType = function (typeobject) {
				this.addtype = typeobject;
				this.addTypeName = typeobject.name;
			};
			this.addType = function () {
				if (s.addtype) {
					// console.log ('adding new artifact of type '+s.addtype);
					ArtifactModel.newFromType (s.addtype.code, $scope.project._id)
					.then (function () {
						s.init ();
					});
				}
			};
			this.init = function () {
				// In this view we don't want individual VC's to show up, instead they will
				// show up in the VC page.
				ArtifactModel.forProjectFilterType ($scope.project._id, "valued-component").then (function (c) {
					s.tableParams = new NgTableParams ({count:10}, {dataset: c});
					// console.log ("artifacts = ", c);
					$scope.$apply ();
				});
				if (!s.public) {
					ArtifactModel.availableTypes ($scope.project._id).then (function (c) {
						// console.log("available types:",c);
						s.availableTypes = c;
						s.addtype = null;
						s.addTypeName = "";
						$scope.$apply ();
					});
				}
			};
			this.init ();
		},
		controllerAs: 's'
	};
})
// -------------------------------------------------------------------------
//
// this wraps up the complete display of an artifact, either a template or
// a document type, in either edit or view mode for each
//
// -------------------------------------------------------------------------
.directive ('tmplArtifactDisplay', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-display.html',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		},
		controller: function ($scope, ArtifactModel, VcModel, _) {
			$scope.removeVCArtifact = function (obj) {
				// We've been asked to remove this VC artifact from the VC artifact collection
				var mainArtifact = obj.mainArtifact;
				var vcArtifact = obj.vcArtifact;
				// Remove it from the main
				ArtifactModel.lookup(mainArtifact)
				.then( function (item) {
					var index = _.findIndex(item.valuedComponents, function(o) {
					    return vcArtifact === o._id;
					});
					if (index !== -1) {
						// Remove it from the main
						// console.log("index:", index);
						item.valuedComponents.splice(index, 1);
						$scope.artifact = item;
						$scope.$apply();
					}
				});
			};
		}
	};
})
.directive ('tmplArtifactVcList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-display-vc-list.html',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		}
	};
})
.directive ('tmplArtifactVcEdit', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/artifacts/client/views/artifact-display-vc-edit.html',
		scope: {
			project: '=',
			artifact: '=',
			mode: '='
		},
		controller: function ($scope, $state, VcModel, ArtifactModel) {
			// Set the other fields to the VC model
			VcModel.lookup($scope.artifact.valuedComponents[0]._id)
			.then( function (vc) {
				$scope.vc = vc;
				$scope.$apply();
			});
			$scope.save = function () {
				if ($scope.artifact) {
					VcModel.saveModel($scope.vc)
					.then ( function (vc) {
						return ArtifactModel.lookup($scope.artifact._id);
					})
					.then ( function (art) {
						// console.log("art: ", art);
						// Update the name of the artifact appropriately
						art.name = $scope.vc.title;
						return ArtifactModel.saveModel(art);
					})
					.then( function () {
						$state.go ('p.vc.list', {reload: true});
					});
				}
			};
		}
	};
})
// -------------------------------------------------------------------------
//
// this wraps up the complete display of an artifact, either a template or
// a document type, in either edit or view mode for each
//
// -------------------------------------------------------------------------
.directive ('artifactDisplayModal', function ($modal) {
	return {
		restrict    : 'A',
		scope       : {
			project  : '=',
			artifact : '=',
			mode     : '='
		},
		link : function (scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation   : true,
					templateUrl : 'modules/artifacts/client/views/artifact-display-modal.html',
					size        : 'lg',
					controller  : function ($scope, $modalInstance) {
						$scope.project  = scope.project;
						$scope.artifact = scope.artifact;
						$scope.mode     = scope.mode;
						$scope.cancel   = function () { $modalInstance.dismiss ('cancel'); };
					}
				});
			});
		}
	};
})
// -------------------------------------------------------------------------
//
// a modal directive with isolated scope for viewing and
// interacting with a list of artifacts in order to choose one.
// so, essentially an artifact chooser
//
// -------------------------------------------------------------------------
.directive ('artifactChooser', function ($modal, ArtifactModel, _) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			artifact: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-chooser.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						artifacts: function (ArtifactModel) {
							return ArtifactModel.forProject (scope.project._id);
						}
					},
					controller: function ($scope, $modalInstance, artifacts) {
						var s = this;
						s.artifacts = artifacts;
						s.selected = scope.artifact._id;
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () { $modalInstance.close (s.selected); };
					}
				})
				.result.then (function (data) {
					if (!(scope.artifact._id && scope.artifact._id === data)) {
						scope.artifact._id = data;
						// console.log ('new artifact is', scope.artifact._id);
					}
				})
				.catch (function (err) {});
			});
		}
	};
})
.directive ('artifactVc', function ($modal, ArtifactModel, _, VcModel) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			artifact: '=',
			current: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function () {
				$modal.open ({
					animation: true,
					templateUrl: 'modules/artifacts/client/views/artifact-vc.html',
					controllerAs: 's',
					size: 'md',
					resolve: {
						artifacts: function (ArtifactModel) {
							// console.log("resolving artifacts");
							return ArtifactModel.forProjectGetType (scope.project._id, "valued-component");
						}
					},
					controller: function ($scope, $modalInstance, artifacts) {
						var s = this;
						s.artifacts = artifacts;
						// console.log("current:",scope.current);
						s.cancel = function () { $modalInstance.dismiss ('cancel'); };
						s.ok = function () {
							// Selected artifact is:
							// console.log("Selected:",s.selected);
							$modalInstance.close (s.selected);
						};
					}
				})
				.result.then (function (data) {
					// References the selected id of the VC artifact to add to the VC package
					// console.log("vc id:",data);
					ArtifactModel.lookup(data)
					.then( function (vcartifact) {
						// console.log("artifactvc:",vcartifact);
						var vc = vcartifact.valuedComponents[0];
						var found = _.find(scope.current.valuedComponents, function (item) {
							return item.artifact === data;
						});
						if (!found) {
							scope.current.valuedComponents.push(vc);
						}
					});
				})
				.catch (function (err) {});
			});
		}
	};
})
;
