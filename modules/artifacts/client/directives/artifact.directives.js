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
				// ArtifactModel.forProjectFilterType ($scope.project._id, "valued-component").then (function (c) {
				// 	s.tableParams = new NgTableParams ({count:10}, {dataset: c});
				// 	// console.log ("artifacts = ", c);
				// 	$scope.$apply ();
				// });
				if (!s.public) {
					ArtifactModel.availableTypes ($scope.project._id).then (function (c) {
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

;
