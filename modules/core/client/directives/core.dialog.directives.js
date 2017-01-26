'use strict';
angular.module('core')
	.directive('confirmDialog', ['$rootScope', '$modal', '$log', '_', 'ConfirmService', function ($rootScope, $modal, $log, _, ConfirmService) {
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
					ConfirmService.confirmDialog(scope);
				});
			}
		};
	}])
	.service('AlertService', ['$rootScope', '$timeout', '$log', '$modal', '_', 'Authentication', function ($rootScope, $timeout, $log, $modal, _) {

		var service = this;

		service.alert = function(type, message) {

			return new Promise(function(fulfill, reject) {
				var modal = $modal.open({
					animation: true,
					templateUrl: 'modules/core/client/views/dialogs/alert.html',
					controller: function ($scope, $state, $modalInstance, _) {
						var self = this;

						switch (type) {
							case 'info':
								self.alertType = 'alert-info';
								break;
							case 'warning':
								self.alertType = 'alert-warning';
								break;
							case 'error':
								self.alertType = 'alert-danger';
								break;
							default:
								self.alertType = 'alert-success';
								break;
						}

						self.msg = message;

						self.ok = function () {
							$modalInstance.close('ok');
						};

						self.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'alertDlg',
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});

				// do not care how this modal is closed, if a callback is provided, call it..
				modal.result
					.then(function (result) {
						fulfill(result);
					}, function (error) {
						fulfill(error);
					});
			});
		};

		service.info = function(message) {
			return service.alert('info', message);
		};

		service.warning = function(message) {
			return service.alert('warning', message);
		};

		service.error = function(message) {
			return service.alert('error', message);
		};

		service.success = function(message) {
			return service.alert('success', message);
		};

	}])
	.service('ConfirmService', ['$rootScope', '$modal', '$log', '_', function ($rootScope, $modal, $log, _) {
		var service = this;
		service.confirmDialog = function(scope) {

			return new Promise(function(fulfill, reject) {
				var modal = $modal.open({
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
						$log.debug(data);
					})
					.catch(function (err) {
						$log.error(err);
					});


			});
		};

	}])
;
