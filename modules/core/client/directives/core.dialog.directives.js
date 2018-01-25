'use strict';
angular.module('core')
	.directive('confirmDialog', ['$rootScope', '$uibModal', '$log', '_', 'ConfirmService', function ($rootScope, $uibModal, $log, _, ConfirmService) {
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
				okArgs: '=',
				warnText: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					ConfirmService.confirmDialog(scope);
				});
			}
		};
	}])
	.service('ConfirmService', ['$rootScope', '$uibModal', '$log', '_', function ($rootScope, $uibModal, $log, _) {
		var service = this;
		service.confirmDialog = function(scope) {

			return new Promise(function(fulfill, reject) {
				var modal = $uibModal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/dialogs/confirm.html',
					resolve: {},
					controllerAs: 'confirmDlg',
					controller: function ($scope, $uibModalInstance) {
						var self = this;
						self.titleText = _.isEmpty(scope.titleText) ? '' : scope.titleText;
						self.okText = _.isEmpty(scope.okText) ? 'OK' : scope.okText;
						self.cancelText = _.isEmpty(scope.cancelText) ? 'Cancel' : scope.cancelText;
						self.confirmText = _.isEmpty(scope.confirmText) ? 'Are you sure you want to do this?' : scope.confirmText;
						self.warnText = scope.warnText;
						var items = _.isEmpty(scope.confirmItems) ? [] : scope.confirmItems;
						// turn the strings into objects for ng-repeat
						var id = 1;
						self.confirmItems = _.map(items, function(item) {
							return {id: id++, value: item};
						});
						self.errorMsg = undefined;

						self.cancel = function () {
							if (scope.onCancel) {
								scope.onCancel()
									.then(function (result) {
										$uibModalInstance.dismiss('cancel');
									}, function (err) {
										self.errorMsg = err.message;
									});
							} else {
								$uibModalInstance.dismiss('cancel');
							}
						};

						self.ok = function () {
							if (scope.onOk) {
								scope.onOk(scope.okArgs)
									.then(function (result) {
										$uibModalInstance.close(result);
									}, function (err) {
										self.errorMsg = err.message;
										$scope.$apply();
									});
							} else {
								$uibModalInstance.close({});
							}
						};

					}
				}).result
					.then(function (data) {
						$log.debug(data);
					})
					.catch(function (err) {
						$log.error(err);
					});


			});
		};

	}])
;
