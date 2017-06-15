'use strict';
angular.module('documents')
.directive('confirmPublish', ['ConfirmPublishService', function (ConfirmPublishService) {
	// x-confirm-publish
	return {
		restrict: 'A',
		scope: {
			docs: '=',
			publisher: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				ConfirmPublishService.confirmDialog(scope);
			});
		}
	};
}])
.service('ConfirmPublishService', ['$rootScope', '$modal', '_', function ($rootScope, $modal, _) {
	var service = this;
	service.confirmDialog = function(scope) {
		return new Promise(function(fulfill, reject) {
			var modal = $modal.open({
				animation: true,
				templateUrl: 'modules/documents/client/views/partials/modal-document-confirm-publish.html',
				resolve: {},
				controllerAs: 'confirmDlg',
				controller: function ($scope, $modalInstance) {
					var self = this;
					// caller may have batch or single file
					self.docs = Array.isArray(scope.docs) ? scope.docs : [ scope.docs ];
					self.publisher = scope.publisher;
					self.submit = submit;
					self.cancel = cancel;
					// collect files that can and can't be published
					self.publishableFiles = [];
					self.missingCategory = [];
					_.each(self.docs, function(o) {
						if (o.userCan.publish) {
							if (o.documentCategories && o.documentCategories.length > 0) {
								self.publishableFiles.push(o);
							} else {
								self.missingCategory.push(o);
							}
						}
					});
					if ( self.publishableFiles.length === 0) {
						self.errMsg = 'No files can be published';
					}
					self.confirmText =
						self.publishableFiles.length > 1 ?
							'Are you sure you want to publish the selected items?' :
							'Are you sure you want to publish the selected file?';

					function cancel() {
							$modalInstance.dismiss('cancel');
					}

					function submit () {
						self.publisher(self.publishableFiles)
						.then(function (result) {
							$modalInstance.close(result);
						}, function (err) {
							self.errMsg = err.message;
							$scope.$apply();
						});
					}
				}
			});
		});
	};
}]);
