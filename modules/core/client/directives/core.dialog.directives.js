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
							//$log.debug(data);
						})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};
	}])
	.service('DialogService', ['$rootScope', '$timeout', '$log', '$modal', '_', 'Authentication', function ($rootScope, $timeout, $log, $modal, _) {

		var service = this;

		service.show = function(type, title, message, items) {

			var _type = type  || 'info'; // success, error, warning, info...
			var _title = title || '';
			var _message = message || '';
			var _items = items || [];

			$modal.open({
				animation: true,
				templateUrl: 'modules/core/client/views/dialogs/info.html',
				resolve: {
				},
				controllerAs: 'infoDlg',
				controller: function ($scope, $modalInstance) {
					var infoDlg = this;

					infoDlg.type = _type;
					infoDlg.titleText = _title;
					infoDlg.messageText = _message;

					// turn the strings into objects for ng-repeat
					var id = 1;
					infoDlg.items = _.map(_items, function(item) {
						return {id: id++, value: item};
					});

					infoDlg.cancel = function () {
						$modalInstance.dismiss('cancel');
					};

					infoDlg.ok = function () {
						$modalInstance.close({});
					};

				}
			}).result
				.then(function (data) {
					$log.debug(data);
				})
				.catch(function (err) {
					$log.error(err);
				});
		};

		service.error = function(title, message, error) {
			// short cut, look in error to see if we can determine a list of error messages, show an error msg dialog
			var items = [];
			if (error) {
				// error.message?
				if (error.message) {
					items.push(error.message);
				}
				if (error.data && error.data.message) {
					items.push(error.data.message);
				}
			}
			return service.show('error', title, message, items);
		};

	}])
;
