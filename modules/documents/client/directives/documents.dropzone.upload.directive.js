'use strict';

angular.module('documents')
	.directive('documentDropZoneUploadModal',['$modal', 'DocumentsUploadService', 'Document', '_', function ($modal, DocumentsUploadService, Document, _){
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
							self.project = $scope.project;
							self.title = "Drop files into '" + self.project.name + "'";
							self.url = '/api/dropzone/' + self.project._id + '/upload';

							$scope.description = "";
							self.cancel = function () {
								if (self.uploadService.actions.completed) {
									// reload the project's drop zone docs and ...
									Document.getDropZoneDocuments(self.project._id)
									.then(function(docList){
										// return doc list from modal and ...
										$modalInstance.close(docList);
									});
								} else {
									self.uploadService.reset();
									$modalInstance.dismiss('cancel');
								}
							};
							self.startUploads = function () {
								var description;
								if ($scope.description && !_.isEmpty(_.trim($scope.description))) {
									description = $scope.description;
								}
								DocumentsUploadService.startUploads(self.url, 0, false, new Date(), description);
							};
						}
					}).result.then(function (docList) {
						if (scope.target) {
							// ... send data back to the caller through target....
							scope.target = docList;
						}
					});
				}); // end element on click
			} // end link
		}; // return
	}])
	.directive('documentDropZoneUpload', ['_', 'DocumentsUploadService', function (_, DocumentsUploadService) {
		return {
			restrict: 'E',
			scope: {
				project			: '=',
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
