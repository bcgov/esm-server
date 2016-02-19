'use strict';

angular.module('documents')
    .controller('controllerDocumentUploadGlobal', controllerDocumentUploadGlobal)
    .controller('controllerDocumentList', controllerDocumentList)
    .controller('controllerDocumentBrowser', controllerDocumentBrowser)
	.controller('controllerModalDocumentViewer', controllerModalDocumentViewer)
	.controller('controllerModalDocumentUploadClassify', controllerModalDocumentUploadClassify)
	.filter('removeExtension', filterRemoveExtension);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
controllerDocumentUploadGlobal.$inject = ['$scope', 'Upload', '$timeout', 'Document', '_'];
/* @ngInject */
function controllerDocumentUploadGlobal($scope, Upload, $timeout, Document, _) {
	var docUpload = this;
	var parentId = null;

	docUpload.inProgress = false;
	docUpload.fileList = [];
	docUpload.type = null;

	$scope.$watch('hideUploadButton', function(newValue) {
		if (newValue) {
			docUpload.hideUploadButton = newValue;
		}
	});

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			docUpload.project = newValue;
			docUpload.setTargetUrl();
			Document.getProjectDocumentFolderNames(newValue._id).then( function(res) {
				docUpload.docFolderNames	= res.data;
			});
		}
	});

	$scope.$watch('parentId', function(newValue) {
		if (newValue) {
			parentId = newValue;
			docUpload.setTargetUrl();
		}
	});

	docUpload.removeFile = function(f) {
		_.remove(docUpload.fileList, f);
	};

	// determine the correct target for the file upload based on x-type attribute.
	docUpload.targetUrl = null;

	$scope.$watch('type', function(newValue) {
		if (newValue) {
			docUpload.type = newValue;
			docUpload.setTargetUrl();
		}
	});


	docUpload.setTargetUrl = function() {
		// determine URL for upload, default to project if none set.
		if (docUpload.type === 'comment' && parentId) {
			docUpload.targetUrl = '/api/commentdocument/publiccomment/' + parentId + '/upload';
		}
		if (docUpload.type === 'project' && docUpload.project) {
			
			docUpload.targetUrl = '/api/document/' + docUpload.project._id + '/upload';
		}
	};

	// get types for dropdown.
	docUpload.docTypes = Document.getDocumentTypes();
	docUpload.docSubTypes = Document.getDocumentSubTypes();

	// allow the upload to be triggered from an external button.
	// this should be called and then documentUploadComplete should be listened for.
	$scope.$on('documentUploadStart', function() {
		docUpload.upload();
	});


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
		var docCount = docUpload.fileList.length;

		if (docUpload.fileList && docUpload.fileList.length && docUpload.targetUrl) {
			angular.forEach( docUpload.fileList, function(file) {
				// Quick hack to pass objects
				if (undefined === docUpload.type.name) docUpload.type.name = "Not Specified";
				if (undefined === docUpload.subType.name) docUpload.subType.name = "Not Specified";
				if (undefined === docUpload.folderName) docUpload.folderName = "Not Specified";

				file.upload = Upload.upload({
					url: docUpload.targetUrl,
					file: file,
					headers: { 'documenttype': docUpload.type.name,
							   'documentsubtype': docUpload.subType.name,
							   'documentfoldername': docUpload.folderName}
				});

				file.upload.then(function (response) {
					$timeout(function () {
						file.result = response.data;
						// when the last file is finished, send complete event.
						if (--docCount === 0) {
							// emit to parent.
							$scope.$emit('documentUploadComplete');
						}
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

		} else {
			// there are no documents so say it's all done
			$scope.$emit('documentUploadComplete');
		}
    };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document List
//
// -----------------------------------------------------------------------------------
// MBL: TODO inject Project, get documents related to this thing.
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
// CONTROLLER: Document List
//
// -----------------------------------------------------------------------------------
controllerDocumentBrowser.$inject = ['$scope', 'Document', '$rootScope'];
/* @ngInject */
function controllerDocumentBrowser($scope, Document, $rootScope) {
	var docBrowser = this;

	docBrowser.documentFiles	= undefined;
	docBrowser.docTypes			= undefined;
	// Review docs
	docBrowser.rdocumentFiles	= undefined;
	docBrowser.rdocTypes		= undefined;
	docBrowser.rDoc 			= undefined;


	docBrowser.refresh = function() {
		Document.getProjectDocuments(docBrowser.project._id, false).then( function(res) {
			console.log('refresh documents');
			docBrowser.documentFiles	= res.data;
			// console.log(res.data);
		});
		Document.getProjectDocumentTypes(docBrowser.project._id, false).then( function(res) {
			docBrowser.docTypes	= res.data;
			// console.log(res.data);
		});
	};

	$rootScope.$on('refreshDocumentList', function() {
		docBrowser.refresh();
	});

	$scope.$watch('project', function(newValue) {
		docBrowser.project = newValue;

		Document.getProjectDocuments(newValue._id, true).then( function(res) {
			docBrowser.rdocumentFiles	= res.data;
			// console.log(res.data);
		});
		Document.getProjectDocumentTypes(newValue._id, true).then( function(res) {
			docBrowser.rdocTypes	= res.data;
			// console.log(res.data);
		});
		docBrowser.refresh();
	});

	docBrowser.filterList = function(searchField, newValue) {
		$scope.filterSummary = undefined;
		$scope.filterDocs = {};
		$scope.filterDocs[searchField] = newValue;
	};
	// Filter for review files
	docBrowser.rfilterList = function(searchField, newValue) {
		$scope.rfilterDocs = {};
		$scope.rfilterDocs[searchField] = newValue;
	};
	docBrowser.filterSummary = function(doc) {
		$scope.bytes = {};
		$scope.filterSummary = doc;
		$scope.filterSummary.MBytes = (doc.internalSize / Math.pow(1024, Math.floor(2))).toFixed(2);
		Document.getProjectDocumentVersions(doc._id).then( function(res) {
			docBrowser.docVersions	= res.data;
			//console.log(res.data);
		});
	};
	docBrowser.rfilterSummary = function(doc) {
		$scope.rfilterSummary = doc;
		Document.getProjectDocumentVersions(doc.project,
											doc.projectFolderType,
											doc.projectFolderSubType,
											doc.projectFolderName,
											doc.documentFileName).then( function(res) {
			docBrowser.docVersions	= res.data;
			// Fix for if a version was uploaded while we hovered overtop last
			if (docBrowser.docVersions[docBrowser.docVersions.length-1].documentVersion >= $scope.rfilterSummary.documentVersion) {
				console.log("Your data is stale!  Refresh the page");
			}
			// console.log(res.data);
		});
	};
	docBrowser.downloadAndApprove = function(doc) {
		console.log("Downloading and approving:",doc);
		// TODO: Hook up the scraping code
		Document.downloadAndApprove(doc._id).then( function(res) {
			// Update the table in the UI - call refresh
			console.log("downloaded and approved!");
		});
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentUploadClassify.$inject = ['$modalInstance', '$scope', 'rProject'];
/* @ngInject */
function controllerModalDocumentUploadClassify($modalInstance, $scope, rProject) {
	var docUploadModal = this;

	// Document upload complete so close and continue.
	$scope.$on('documentUploadComplete', function() {
		$modalInstance.close();
	});

	docUploadModal.project = rProject;

	docUploadModal.ok = function () { 
		$scope.$broadcast('documentUploadStart');
	};
	docUploadModal.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentViewer.$inject = ['$modalInstance'];
/* @ngInject */
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
// controllerModalDocumentBuckets.$inject = ['$modalInstance'];
// /* @ngInject */
// function controllerModalDocumentBuckets($modalInstance) {
// 	var docBuckets = this;
// 	docBuckets.ok = function () { $modalInstance.close(); };
// 	docBuckets.cancel = function () { $modalInstance.dismiss('cancel'); };
// }

// -----------------------------------------------------------------------------------
//
// FILTER: Remove Extension
//
// -----------------------------------------------------------------------------------
filterRemoveExtension.$inject = [];
/* @ngInject */
function filterRemoveExtension() {
	return function(input) {
		if (input) {
			var filename = input.split('.');
			return filename[0];
		} 
		return input;
	};
}



