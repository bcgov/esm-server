'use strict';

angular.module('documents')
    .controller('controllerDocumentUploadGlobal', controllerDocumentUploadGlobal)
    .controller('controllerDocumentList', controllerDocumentList)
	.controller('controllerModalDocumentViewer', controllerModalDocumentViewer)
	.controller('controllerModalDocumentBuckets', controllerModalDocumentBuckets);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
controllerDocumentUploadGlobal.$inject = ['$scope', 'Upload', '$timeout', 'Document', '_'];
/* @ngInject */
function controllerDocumentUploadGlobal($scope, Upload, $timeout, Document, _) {
	var docUpload = this;

	docUpload.fileList = [];
	docUpload.inProgress = false;

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			docUpload.project = newValue;
		}
	});

	// determine the correct target for the file upload based on x-type attribute.
	docUpload.targetUrl = null;
	$scope.$watch('type', function(newValue) {
		if (newValue) {
			// determine URL for upload, default to project if none set.
			switch (newValue) {
				case 'comment':
					// comment type
					docUpload.targetUrl = '/api/commentdocument/publiccomment/56733270672dadc5372f7bea/upload'; // todo: UPLOAD
					break;
				default:
					// project type
					docUpload.targetUrl = '/api/commentdocument/publiccomment/56733270672dadc5372f7bea/upload'; // todo: UPLOAD
			}
			docUpload.project = newValue;
		}
	});

	// get types for dropdown.
	docUpload.docTypes = Document.getDocumentTypes();


	$scope.$watch('files', function (newValue) {
		if (newValue) {
			docUpload.inProgress = false;
			_.each( newValue, function(file, idx) {
				docUpload.fileList.push(file);
			});
		}
		// add the file to our central list.
		// click the upload buton to actually upload this list.

		//docUpload.upload($scope.files);
	});

	// $scope.$watch('file', function () {
	// 	if (docUpload.file) {
	// 		docUpload.upload([docUpload.file]);
	// 	}
	// });
	// docUpload.log = '';

	docUpload.upload = function () {
		docUpload.inProgress = true;
		if (docUpload.fileList && docUpload.fileList.length && docUpload.targetUrl) {

			angular.forEach($scope.files, function(file) {
				file.upload = Upload.upload({
					url: docUpload.targetUrl,
					file: file
				});

				file.upload.then(function (response) {
					$timeout(function () {
						file.result = response.data;
					});
				}, function (response) {
					if (response.status > 0) {
						docUpload.errorMsg = response.status + ': ' + response.data;
					} else {
						_.remove($scope.files, file);
					}
				}, function (evt) {
					file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
				});
			});

		}
    };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document List
//
// -----------------------------------------------------------------------------------
controllerDocumentList.$inject = ['$scope'];
/* @ngInject */
function controllerDocumentList($scope) {
	var docList = this;
	console.log($scope.documents);

	$scope.$watch('documents', function(newValue) {
		docList.filterDocuments = newValue;
	});

	$scope.$watch('filterBy', function(newValue) {
		docList.filterId = newValue;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentViewer.$inject = ['$modalInstance'];
//
function controllerModalDocumentViewer($modalInstance) {
	var md = this;
	md.ok = function () { $modalInstance.close(); };
	md.cancel = function () { $modalInstance.dismiss('cancel'); };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentBuckets.$inject = ['$modalInstance'];
//
function controllerModalDocumentBuckets($modalInstance) {
	var docBuckets = this;
	docBuckets.ok = function () { $modalInstance.close(); };
	docBuckets.cancel = function () { $modalInstance.dismiss('cancel'); };
}
