'use strict';
angular.module('core')
	.directive('confirmDialog', ['$rootScope', '$modal', '$log', '_', function ($rootScope, $modal, $log, _) {
		return {
			restrict: 'A',
			scope: {
				titleText: '=',
				confirmText: '=',
				confirmItems: '=',
				okText: '=',
				cancelText: '=',
				onOk: '=',
				onCancel: '=',
				okArgs: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/core/client/views/dialogs/confirm.html',
						resolve: {},
						controllerAs: 'confirmDlg',
						controller: function ($scope, $modalInstance) {
							var self = this;

							self.titleText = _.isEmpty(scope.titleText) ? '' : scope.titleText;
							self.okText = _.isEmpty(scope.okText) ? 'OK' : scope.okText;
							self.cancelText = _.isEmpty(scope.cancelText) ? 'Cancel' : scope.cancelText;
							self.confirmText = _.isEmpty(scope.confirmText) ? 'Are you sure you want to do this?' : scope.confirmText;
							self.confirmItems = _.isEmpty(scope.confirmItems) ? [] : scope.confirmItems;
							self.errorMsg = undefined;

							self.cancel = function () {
								if (scope.onCancel) {
									scope.onCancel()
										.then(function (result) {
											$modalInstance.dismiss('cancel');
										}, function (err) {
											self.errorMsg = err.message;
										});
								} else {
									$modalInstance.dismiss('cancel');
								}
							};

							self.ok = function () {
								if (scope.onOk) {
									scope.onOk(scope.okArgs)
										.then(function (result) {
											$modalInstance.close(result);
										}, function (err) {
											self.errorMsg = err.message;
											$scope.$apply();
										});
								} else {
									$modalInstance.close({});
								}
							};

						}
					}).result
						.then(function (data) {
							//$log.debug(data);
						})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};
	}])

;
