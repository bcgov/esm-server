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
				ArtifactModel.forProject ($scope.project._id).then (function (c) {
					s.tableParams = new NgTableParams ({count:10}, {dataset: c});
					// console.log ("artifacts = ", c);
					$scope.$apply ();
				});
				ArtifactModel.availableTypes ($scope.project._id).then (function (c) {
					s.availableTypes = c;
					s.addtype = null;
					s.addTypeName = "";
					$scope.$apply ();
				});
			};
			this.init ();
		},
		controllerAs: 's'
	};

})

;
