'use strict';
angular.module('documents')
	.directive('documentMgrRenameFolder', ['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', 'AlertService', 'TreeModel', function ($rootScope, $modal, $log, _, DocumentMgrService, AlertService, TreeModel) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				root: '=',
				node: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						size: 'lg',
						templateUrl: 'modules/documents/client/views/document-manager-add.html',
						resolve: {},
						controllerAs: 'addFolder',
						controller: function ($scope, $modalInstance) {
							var self = this;

							$scope.project = scope.project;
							$scope.node = scope.node || scope.root;

							self.entryText = '';
							self.title = "Rename Folder '" + $scope.node.model.folderObj.displayName + "'";
							if ($scope.node.model.name === 'ROOT') {
								$modalInstance.dismiss('cancel');
							}

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.ok = function () {
								DocumentMgrService.renameDirectory($scope.project, $scope.node, self.entryText)
									.then(
										function (result) {
											$modalInstance.close(result.data);
										},
										function (err) {
											AlertService.error("Could not rename folder: " + err.data.message);
										}
									);
							};

						}
					}).result.then(function (data) {
						console.log("deleted data:", data);
						$rootScope.$broadcast('documentMgrRefreshNode', { directoryStructure: data });
					})
					.catch(function (err) {
						//$log.error(err);
					});
				});
			}
		};
	}])
;
