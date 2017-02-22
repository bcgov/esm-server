'use strict';
// =========================================================================
//
// connect with us routes
//
// =========================================================================
angular.module('connect')
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('connect-with-us', {
				url: '/connect-with-us',
				templateUrl: 'modules/connect/client/views/connect-with-us.html',
				controllerAs: 'connect',
				// data: {
				// 	roles: ['admin']
				// },
				resolve: {
					comment: function (CommentModel) {
						return CommentModel.getNew();
					}
				},
				controller: function ($scope, $state, $uibModal, CommentModel) {
					$scope.busy = false;
					$scope.save = save;
					function save(isValid) {
						if (!isValid) {
							$scope.$broadcast('show-errors-check-validity', 'commentForm');
							return false;
						}
						$scope.busy = true;
						var p = CommentModel.add($scope.comment);
						p.then(function (model) {
							showSuccess($uibModal);
						})
							.catch(function (err) {
								console.error(err);
							});
					}
					function showSuccess($uibModal) {
						var modalDocView = $uibModal.open({
							//animation: true,
							size: 'md',
							templateUrl: 'modules/connect/client/views/connect-with-us-success.html',
							controller: function ($scope, $modalInstance) {
								var self = this;
								console.log("Show modal");
								$scope.ok = function () {
									$modalInstance.close();
								};
							}
							// windowClass: 'modal-alert',
							// backdropClass: 'modal-alert-backdrop'
						});
						// do not care how this modal is closed, just go to the desired location...
						modalDocView.result.then(function (res) {
							transition();
						}, function (err) {
							transition();
						});
					}
					function transition() {
						$state.transitionTo('home', {}, {
							reload: true, inherit: false, notify: true
						});
					}
				}
			});
	}]);
