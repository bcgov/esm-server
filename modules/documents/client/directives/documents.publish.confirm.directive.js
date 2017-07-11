'use strict';
angular.module('documents')
.directive('confirmPublish', ['ConfirmPublishService', function (ConfirmPublishService) {
	// x-confirm-publish
	return {
		restrict: 'A',
		scope: {
			docs: '=',
			currentNode: "=", // current parent folder
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
					self.currentPath = scope.currentNode.getPath();
					self.submit = submit;
					self.cancel = cancel;
					// collect files that can be published
					self.publishableFiles = [];
					self.showSubmit = true;
					self.cancelText = 'No';
					// collect unpublished folders on path.
					var unpublishedFolders = _.filter(self.currentPath, function(p) { return ! p.model.published; });
					if (unpublishedFolders.length > 0) {
						self.showSubmit = false;
						self.cancelText = 'OK';
						var fldNames = _.map(unpublishedFolders, function (fld) { return fld.model.name; });
						var last = fldNames.pop();
						var prefix = fldNames.length > 0 ? fldNames.join(', ') + " and " : '';
						var msg = prefix + last;
						var suffix = self.docs.length > 1 ? ' to publish these documents.' : ' to publish this document';
						if (fldNames.length > 0) {
							self.errMsg = "You need to publish parent folders " + msg + suffix;
						} else {
							self.errMsg = "You need to publish parent folder " + msg + suffix;
						}
					} else {
						_.each(self.docs, function (o) {
							if (o.userCan.publish) {
								// can do other valiation here.
								self.publishableFiles.push(o);
							}
						});
						if (self.publishableFiles.length === 0) {
							self.errMsg = 'No files can be published';
						}
						self.confirmText =
							self.publishableFiles.length > 1 ?
								'Are you sure you want to publish the selected files?' :
								'Are you sure you want to publish the selected file?';
					}

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
