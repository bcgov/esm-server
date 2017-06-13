'use strict';

angular.module('documents')
// document-drop-zone-upload-modal
	.directive('documentDropZoneUploadModal',['$modal', '$rootScope', 'DocumentsUploadService', 'Document', '_', function ($modal, $rootScope, DocumentsUploadService, Document, _){
		return {
			restrict: 'A',
			scope: {
				project	: '=',
				target	: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function (event) {
					event.stopPropagation();
					$modal.open({
						animation: true,
						size: 'lg',
						templateUrl: 'modules/documents/client/views/document-dropzone-upload-modal.html',
						resolve: {},
						backdrop: 'static',
						controllerAs: 'uploadModal',
						controller: function ($scope, $modalInstance) {
							var self = this;

							$scope.uploadService = self.uploadService = DocumentsUploadService;
							self.uploadService.reset(); // just in case... want the upload service to be cleared
							self.project = scope.project;
							self.title = "Upload files into '" + self.project.name + "'";
							self.url = '/api/dropzone/' + self.project._id + '/upload';

							$scope.description = "";
							self.done = done;
							self.cancel = cancel;
							self.startUploads = startUploads;

							$scope.$watch(function ($scope) {
									return $scope.uploadService.actions.completed;
								},
								function (completed) {
									if (completed) {
										$rootScope.$broadcast('dropZoneRefresh');
									}
								}
							);

							function done () {
								if (self.uploadService.actions.completed) {
									$modalInstance.close();
								} else {
									self.uploadService.reset();
									$modalInstance.dismiss('cancel');
								}
							}

							function cancel () {
								self.uploadService.reset();
								$modalInstance.dismiss('cancel');
							}

							function startUploads () {
								var description;
								if ($scope.description && !_.isEmpty(_.trim($scope.description))) {
									description = $scope.description;
								}
								DocumentsUploadService.startUploads(self.url, 0, false, new Date(), description);
							}
						}
					});
				}); // end element on click
			} // end link
		}; // return
	}])
	//document-drop-zone-upload
	.directive('documentDropZoneUpload', ['_', 'DocumentsUploadService', function (_, DocumentsUploadService) {
		return {
			restrict: 'E',
			scope: {
				project		: '=',
				description	: '=' // share description via scope with documentDropZoneUploadModal
			},
			templateUrl: 'modules/documents/client/views/document-dropzone-upload.html',
			controller: function ( $scope ) {

				$scope.uploadService = DocumentsUploadService;

				$scope.$watch('files', function (newValue) {
					if (newValue) {
						_.each(newValue, function(file, idx) {
							$scope.uploadService.addFile(file);
						});
					}
				});
			}
		};
	}])
;
