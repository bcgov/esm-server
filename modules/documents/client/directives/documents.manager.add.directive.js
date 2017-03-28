'use strict';
angular.module('documents')

	.directive('documentMgrAddFolder', ['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', 'AlertService', 'TreeModel', function ($rootScope, $modal, $log, _, DocumentMgrService, AlertService, TreeModel) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				node: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/documents/client/views/document-manager-add.html',
						resolve: {},
						controllerAs: 'addFolder',
						controller: function ($scope, $modalInstance) {
							var self = this;

							$scope.project = scope.project;
							$scope.node = scope.node;

							self.entryText = '';
							self.title = "Add Folder to '" + $scope.node.model.name + "'";
							if ($scope.node.model.name === 'ROOT') {
								self.title = "Add Folder to '" + $scope.project.name + "'";
							}

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.ok = function () {
								DocumentMgrService.addDirectory($scope.project, $scope.node, self.entryText)
									.then(
										function (result) {
											$modalInstance.close(result.data);
										},
										function (err) {
											//$log.error('addDirectory error: ', JSON.stringify(err));
											AlertService.error("Could not add folder: " + err.data.message);
										}
									);
							};

						}
					}).result.then(function (data) {
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
