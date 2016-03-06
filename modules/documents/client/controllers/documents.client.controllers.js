'use strict';

angular.module('documents')
    .controller('controllerDocumentUploadGlobal', controllerDocumentUploadGlobal)
    .controller('controllerDocumentLinkGlobal', controllerDocumentLinkGlobal)
    .controller('controllerDocumentList', controllerDocumentList)
    .controller('controllerDocumentBrowser', controllerDocumentBrowser)
	.controller('controllerModalDocumentViewer', controllerModalDocumentViewer)
	.controller('controllerModalDocumentUploadClassify', controllerModalDocumentUploadClassify)
	.controller('controllerModalDocumentLink', controllerModalDocumentLink)
	.controller('controllerModalDocumentUploadReview', controllerModalDocumentUploadReview)
	.filter('removeExtension', filterRemoveExtension);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
controllerDocumentLinkGlobal.$inject = ['$scope', 'Upload', '$timeout', 'Document', '_'];
/* @ngInject */
function controllerDocumentLinkGlobal($scope, Upload, $timeout, Document, _) {
	var docLink = this;
	docLink.linkFiles = [];
	docLink.project = null;
	docLink.current = [];

	docLink.ids = [];

	docLink.changeItem = function (docObj) {
		var idx = $scope.current.indexOf(docObj._id);
		console.log(idx);
		if (idx === -1) {
			docLink.linkFiles.push(docObj);
			$scope.current.push(docObj._id);
		} else {
			_.remove(docLink.linkFiles, {_id: docObj._id});
			_.remove($scope.current, function(n) {return n === docObj._id;});
		}
	};

	$scope.$on('toggleDocumentLink', function(event, docObj) {
		docLink.changeItem(docObj);
	});

	$scope.$watch('current', function(newValue) {
		// Bring in existing values.
		if (newValue) {
			// get the objects from the array.
			Document.getDocumentsInList (newValue).then( function(res) {
				docLink.linkFiles = res.data;
			});
		}
	});

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			docLink.project = newValue;
			// console.log("project:",docLink.project);
			// TODO: Format in a nice list.
			Document.getProjectDocuments(docLink.project._id,false).then( function(res) {
				docLink.documents = res.data;
				// console.log("res:",res.data);
			});
		}
	});

	$scope.$on('documentLinkDone', function() {
		// This is an array of objectID's that the user decided to link
		// console.log("documentLinkDone",docLink.linkFiles);
		// Set the new array before we return back to the caller
		$scope.current = [];
		_.each(docLink.linkFiles, function(item) {
			console.log('save', item);
			$scope.current.push(item._id);
		});
	});
}
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
	$scope.$on('documentUploadStart', function(event, reviewUploader) {
		docUpload.upload(reviewUploader);
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

	docUpload.upload = function (uploadingReviewDocs) {
		docUpload.inProgress = true;
		var docCount = docUpload.fileList.length;
		console.log('upload', docCount);
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
							   'documentfoldername': docUpload.folderName,
							   'documentisinreview': uploadingReviewDocs}
				});

				file.upload.then(function (response) {
					$timeout(function () {
						file.result = response.data;
						console.log('file', response.data);
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
controllerDocumentList.$inject = ['$scope', 'Authentication'];
/* @ngInject */
function controllerDocumentList($scope, sAuthentication) {
	var docList = this;

	docList.authentication = sAuthentication;

	$scope.$watch('documents', function(newValue) {
		docList.documents = newValue;
	});

	$scope.$watch('documentsObjs', function(newValue) {
		docList.documentsObjs = newValue;
	});

	$scope.$watch('allowEdit', function(newValue) {
		docList.allowEdit = !!newValue;
	});

	$scope.$watch('project', function(newValue) {
		docList.project = newValue;
	});
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document List
//
// -----------------------------------------------------------------------------------
controllerDocumentBrowser.$inject = ['$scope', 'Document', '$rootScope', 'Authentication'];
/* @ngInject */
function controllerDocumentBrowser($scope, Document, $rootScope, Authentication) {
	var docBrowser = this;

	docBrowser.documentFiles	= undefined;
	docBrowser.docTypes			= undefined;
	// Review docs
	docBrowser.rdocumentFiles	= undefined;
	docBrowser.rdocTypes		= undefined;
	docBrowser.rDoc 			= undefined;

	docBrowser.authentication = Authentication;
	// -----------------------------------------------------------------------------------
	//
	// BROWSER: A complete refresh of everything.
	//
	// -----------------------------------------------------------------------------------
	docBrowser.refresh = function() {
		Document.getProjectDocuments(docBrowser.project._id, false).then( function(res) {
			// console.log('refresh documents');
			docBrowser.documentFiles	= res.data;
			// console.log(res.data);
		});
		Document.getProjectDocumentTypes(docBrowser.project._id, false).then( function(res) {
			docBrowser.docTypes	= res.data;
			// console.log(res.data);
		});
		Document.getProjectDocuments(docBrowser.project._id, true).then( function(res) {
			docBrowser.rdocumentFiles	= res.data;
			// console.log(res.data);
		});
		Document.getProjectDocumentTypes(docBrowser.project._id, true).then( function(res) {
			docBrowser.rdocTypes	= res.data;
			// console.log(res.data);
		});
	};

	var unbind = $rootScope.$on('refreshDocumentList', function() {
		docBrowser.refresh();
	});
	$scope.$on('$destroy', unbind);

	// -----------------------------------------------------------------------------------
	//
	// BROWSER: If in link mode, add the current document to the link list, or remove.
	//
	// -----------------------------------------------------------------------------------
	docBrowser.toggleDocumentLink = function(docObj) {
		$rootScope.$broadcast('toggleDocumentLink', docObj);
	};
	// -----------------------------------------------------------------------------------
	//
	// BROWSER: Wait for the allowLink
	//
	// -----------------------------------------------------------------------------------
	$scope.$watch('allowLink', function(newValue) {
		if (newValue) {
			docBrowser.allowLink = !!newValue;
		} else {
			docBrowser.allowLink = false;
		}
	});
	// -----------------------------------------------------------------------------------
	//
	// BROWSER: Wait for the Project, Load everythin related
	//
	// -----------------------------------------------------------------------------------
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
	// -----------------------------------------------------------------------------------
	//
	// BROWSER: Filtering
	//
	// -----------------------------------------------------------------------------------
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
				// console.log("Your data is stale!  Refresh the page");
			}
			// console.log(res.data);
		});
	};
	docBrowser.downloadAndApprove = function(doc) {
		// console.log("Downloading and approving:",doc);
		// TODO: Hook up the scraping code
		Document.downloadAndApprove(doc._id).then( function(res) {
			// Update the table in the UI - call refresh
			// console.log("downloaded and approved!");
		});
	};
	docBrowser.rejectDocument = function(doc) {
		// Delete it from the system.
		Document.deleteDocument(doc._id).then( function(res) {
			$rootScope.$broadcast('refreshDocumentList');
		});
	};
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentLink.$inject = ['$modalInstance', '$scope', 'rProject', 'rCurrent', '_'];
/* @ngInject */
function controllerModalDocumentLink($modalInstance, $scope, rProject, rCurrent, _) {
	var docLink = this;
	docLink.linkFiles = [];
	docLink.project = rProject;
	docLink.current = rCurrent;

	docLink.savedCurrent = angular.copy(rCurrent);

	docLink.unlinkFile = function(f) {
		console.log(f);
		//_.remove(docLink.documentsObjs, {_id: f._id});
		//_.remove(docLink.documents, function(n) {return n === f._id; });
	};

	docLink.ok = function (items) {
		console.log(items);
		$modalInstance.close();
	};
	docLink.cancel = function () {
		rCurrent = docLink.savedCurrent;
		$modalInstance.dismiss('cancel');
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
		$scope.$broadcast('documentUploadStart', false);
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
controllerModalDocumentUploadReview.$inject = ['$modalInstance', '$scope', 'rProject'];
/* @ngInject */
function controllerModalDocumentUploadReview($modalInstance, $scope, rProject) {
	var docUploadModalReview = this;

	// Document upload complete so close and continue.
	$scope.$on('documentUploadComplete', function() {
		$modalInstance.close();
	});

	docUploadModalReview.project = rProject;

	docUploadModalReview.ok = function () {
		$scope.$broadcast('documentUploadStart', true);
	};
	docUploadModalReview.cancel = function () {
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



