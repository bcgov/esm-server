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
				// data: {
				// 	roles: ['admin']
				// },
				resolve: {
					comment: function (CommentModel) {
						return CommentModel.getNew();
					}
				},
				controller: function ($scope, $state, CommentModel, comment) {
					var s = this;
					$scope.busy = false;
					$scope.save = function (isValid) {
						if (!isValid) {
							$scope.$broadcast('show-errors-check-validity', 'commentForm');
							return false;
						}
						$scope.busy = true;
						var p = CommentModel.add($scope.comment);
						p.then(function (model) {
							$('#thanksModal').modal();
						})
							.catch(function (err) {
								console.error(err);
							});
					};
					$scope.userConfirmed = function () {
						$state.transitionTo('home', {}, {
							reload: true, inherit: false, notify: true
						});
					}
				},
				controllerAs: 'connect'
			});
	}]);
