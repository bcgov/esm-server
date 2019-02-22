'use strict';

angular.module('documents')
  .controller('controllerDocumentUploadGlobal', controllerDocumentUploadGlobal)
  .controller('controllerDocumentLinkGlobal', controllerDocumentLinkGlobal)
  .controller('controllerDocumentList', controllerDocumentList)
  .controller('controllerDocumentBrowser', controllerDocumentBrowser)
  .controller('controllerModalPdfViewer', controllerModalPdfViewer)
  .controller('controllerModalDocumentViewer', controllerModalDocumentViewer)
  .controller('controllerModalDocumentUploadClassify', controllerModalDocumentUploadClassify)
  .controller('controllerModalDocumentLink', controllerModalDocumentLink)
  .controller('controllerModalDocumentUploadReview', controllerModalDocumentUploadReview)
  .controller('controllerModalDocumentInstructions', controllerModalDocumentInstructions)
  .controller('controllerSignatureUpload', controllerSignatureUpload)
  .filter('removeExtension', filterRemoveExtension)
  .filter('displayFriendlyCode', filterDisplayFriendlyLocationCode)
  .filter('bytes', filterBytes);

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

  docLink.docLocationCode = $scope.docLocationCode;
  docLink.artifact = $scope.artifact;

  docLink.sav = angular.copy($scope.current);


  var addDocument = function(data) {
    docLink.changeItem(data);
  };


  docLink.documentsControl = {
    add: addDocument,
    remove: function () {},
    reset: function () {},
    update: function () {}
  };

  var notifyLibraryReset = function() {
    if ($scope.documentsControl && $scope.documentsControl.reset) {
      $scope.documentsControl.reset(docLink.sav);
    }
  };

  var notifyLibraryUpdate = function() {
    if ($scope.documentsControl && $scope.documentsControl.update) {
      $scope.documentsControl.update($scope.current);
    }
  };

  docLink.changeItem = function (docObj) {
    if ($scope.current) {
      var idx = $scope.current.indexOf(docObj._id);
      if (idx === -1) {
        docLink.linkFiles.push(docObj);
        $scope.current.push(docObj._id);
      } else {
        _.remove(docLink.linkFiles, {_id: docObj._id});
        _.remove($scope.current, function(n) {return n === docObj._id;});
      }
      notifyLibraryUpdate();
    }
  };

  $scope.$on('linkCancel', function () {
    // Need to rebuild the old array - since we're cancelling this whole operation
    notifyLibraryReset();
  });

  $scope.$on('toggleDocumentLink', function(event, docObj) {
    docLink.changeItem(docObj);
  });

  $scope.$watch('current', function(newValue) {
    // Bring in existing values.
    if (newValue) {
      // get the objects from the array.
      Document.getDocumentsInList (newValue)
        .then( function(res) {
          docLink.linkFiles = res;
        });
    }
  });

  $scope.$watch('project', function(newValue) {
    if (newValue) {
      docLink.project = newValue;
      // TODO: Format in a nice list.
      Document.getProjectDocuments(docLink.project._id,false).then( function(res) {
        docLink.documents = res.data;
      });
    }
  });

  $scope.$on('documentLinkDone', function() {
    // This is an array of objectID's that the user decided to link
    // Set the new array before we return back to the caller
    $scope.current = [];
    _.each(docLink.linkFiles, function(item) {
      $scope.current.push(item);
    });
  });
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Document Upload General
//
// -----------------------------------------------------------------------------------
controllerDocumentUploadGlobal.$inject = ['$rootScope', '$scope', 'Upload', '$timeout', 'Document', '_', 'ENV'];
/* @ngInject */
function controllerDocumentUploadGlobal($rootScope, $scope, Upload, $timeout, Document, _, ENV) {
  var docUpload = this;
  var parentId = null;

  $scope.environment = ENV;

  docUpload.inProgress = false;
  docUpload.fileList = [];
  docUpload.type = null;
  docUpload.artifact = null;
  docUpload.artifacts = null;
  docUpload.documentList = [];
  docUpload.selectedArtifact = null;
  docUpload.docTypes = [];

  docUpload.allowArtifactSelect = true;
  docUpload.allowDocLocationSelect = true;


  $scope.$watch('hideUploadButton', function(newValue) {
    if (newValue) {
      docUpload.hideUploadButton = newValue;
    }
  });

  $scope.$watch('project', function(newValue) {
    if (newValue) {
      docUpload.project = newValue;
      docUpload.setTargetUrl();
      Document.getProjectDocumentFolderNames(newValue._id)
        .then( function (res) {
          docUpload.docFolderNames = res;
          docUpload.folderName = docUpload.docFolderNames[0];
          return Document.getProjectDocumentTypes(newValue._id, false);
        })
        .then( function (res) {
          _.each(res, function (item) {
            if (item.reference === 'projectFolderType') {
              docUpload.docTypes.push(item.label);
            }
          });
          // First result is default
          docUpload.typeName = docUpload.docTypes[0];
          return Document.getProjectDocumentSubTypes(newValue._id, false);
        })
        .then( function (res) {
          docUpload.docSubTypes = res;
          docUpload.subTypeName = docUpload.docSubTypes[0];
          $scope.$apply();
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
    docUpload.checkEnableUpload();
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

  // allow the upload to be triggered from an external button.
  // this should be called and then documentUploadComplete should be listened for.
  $scope.$on('documentUploadStart', function(event, reviewUploader) {
    docUpload.upload(reviewUploader);
  });

  docUpload.checkEnableUpload = function () {
    if (docUpload.fileList.length > 0) {
      $rootScope.$broadcast('enableUpload', { enableUpload: true });
    } else {
      $rootScope.$broadcast('enableUpload', { enableUpload: false });
    }
  };

  $scope.$watch('files', function (newValue) {
    if (newValue) {
      docUpload.inProgress = false;
      _.each( newValue, function(file) {
        docUpload.fileList.push(file);
      });
    }
    docUpload.checkEnableUpload();
  });

  $scope.$watch('docUpload.selectedArtifact', function () {
    docUpload.checkEnableUpload();
  });
  $scope.$watch('docUpload.selectedDocLocation', function () {
    docUpload.checkEnableUpload();
  });

  docUpload.upload = function (uploadingReviewDocs) {
    var docCount = null;
    docUpload.inProgress = true;
    docCount = docUpload.fileList.length;
    if (docUpload.fileList && docUpload.fileList.length && docUpload.targetUrl) {
      angular.forEach( docUpload.fileList, function(file) {
        // Quick hack to pass objects
        if (undefined === docUpload.typeName) {docUpload.typeName = "Not Specified";}
        if (undefined === docUpload.subTypeName) {docUpload.subTypeName = "Not Specified";}
        if (undefined === docUpload.folderName) {docUpload.folderName = "Not Specified";}

        file.upload = Upload.upload({
          url: docUpload.targetUrl,
          file: file,
          body: { 'documenttype': docUpload.typeName,
            'documentsubtype': docUpload.subTypeName,
            'documentfoldername': docUpload.folderName,
            'documentisinreview': uploadingReviewDocs}
        });

        file.upload.then(function (response) {
          $timeout(function () {
            file.result = response.data;
            // when the last file is finished, send complete event.
            if ($scope.documentsControl && $scope.documentsControl.add) {
              $scope.documentsControl.add(file.result);
            }
            if (--docCount === 0) {
              // emit to parent, this will close the upload modal...
              $scope.$emit('documentUploadCompleteF');
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
      $scope.$emit('documentUploadCompleteF');
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
controllerDocumentBrowser.$inject = ['$scope', 'Document', '$rootScope', 'Authentication', 'ENV', '_'];
/* @ngInject */
function controllerDocumentBrowser($scope, Document, $rootScope, Authentication, ENV, _) {
  var docBrowser = this;

  $scope.environment = ENV;

  docBrowser.documentFiles	= undefined;
  docBrowser.docTypes			= undefined;
  // Review docs
  docBrowser.rdocumentFiles	= undefined;
  docBrowser.rdocTypes		= undefined;
  docBrowser.rDoc 			= undefined;

  docBrowser.authentication = Authentication;

  docBrowser.docLocationCode= $scope.docLocationCode;
  docBrowser.artifact = $scope.artifact;


  var addDocument = function(data) {
    if ($scope.documentsControl && $scope.documentsControl.add) {
      $scope.documentsControl.add(data);
    }
  };

  docBrowser.documentsControl = {
    add: addDocument,
    remove: function () {},
    reset: function () {},
    update: function () {}
  };

  // -----------------------------------------------------------------------------------
  //
  // BROWSER: A complete refresh of everything.
  //
  // -----------------------------------------------------------------------------------
  docBrowser.refresh = function() {
    Document.getProjectDocuments(docBrowser.project._id, $scope.approvals)
      .then( function(res) {
        if (ENV === 'MEM') {
          // Apply slightly different sort criteria on the client side.
          // Do a substring date search on the internalOriginalName field.
          var docs = [];
          var re =/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/;
          angular.forEach( res, function(item) {
            var sortDate = re.exec(item.internalOriginalName);
            if (sortDate)
            {item.sortDate = sortDate[0];}
            docs.push(item);
          });
          docBrowser.documentFiles = _.sortByOrder(docs, "sortDate", "desc");
        } else {
          docBrowser.documentFiles = res;
        }
        $scope.$apply();
      });
    Document.getProjectDocumentTypes(docBrowser.project._id, $scope.approvals)
      .then( function(res) {
        var dts = [];
        if (ENV === 'MEM') {
          var sorted = _.sortBy(res, "order");
          dts	= sorted;
        } else {
          dts	= res;
        }
        angular.forEach(dts, function(item) {
          item.state = 'close';
          item.render = item.depth === 1;
        });
        docBrowser.docTypes = dts;
        $scope.$apply();
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
    docBrowser.refresh();
  });
  // -----------------------------------------------------------------------------------
  //
  // BROWSER: Filtering
  //
  // -----------------------------------------------------------------------------------
  function onFolderSelect(selection) {

    // all items in the selection's Project Folder Type (root folder)...
    var selectedProjectFolderType = _.filter(docBrowser.docTypes, function (item) {
      return item.lineage.projectFolderType === selection.lineage.projectFolderType;
    });

    var otherProjectFolderTypes = _.filter(docBrowser.docTypes, function (item) {
      return item.lineage.projectFolderType !== selection.lineage.projectFolderType;
    });

    // only the items we care about...
    // selected level 1 will include all level 2, but no level 3
    // selected level 2 will have level 1 and itself and it's children, no sibling level 2 or their children
    var selectedTree = _.filter(docBrowser.docTypes, function (item) {
      if (selection.depth === 1) {
        return item.depth < 3 && item.lineage.projectFolderType === selection.lineage.projectFolderType;
      } else {
        return (item.depth === 1 && item.lineage.projectFolderType === selection.lineage.projectFolderType) ||
          (item.depth > 1 && item.lineage.projectFolderType === selection.lineage.projectFolderType && item.lineage.projectFolderSubType === selection.lineage.projectFolderSubType);
      }
    });

    if (selection.state === 'open') {
      // open to close
      _.forEach(selectedProjectFolderType, function(item) {
        item.render = item.depth <= selection.depth;
        item.state = 'close';
      });
      _.forEach(selectedTree, function(item) {
        item.render = item.depth <= selection.depth;
        item.state = (item.depth < selection.depth) ? 'open' : 'close';
      });
      selection.state = 'close';
      selection.render = true;
    } else {
      // close to open
      _.forEach(selectedProjectFolderType, function(item) {
        item.render = selection.depth < 3 ? item.depth <= selection.depth : item.depth < selection.depth;
        item.state = 'close';
      });
      _.forEach(selectedTree, function(item) {
        item.render = item.depth <= selection.depth + 1;
        item.state = (item.depth < selection.depth) ? 'open' : 'close';
      });
      selection.state = 'open';
      selection.render = true;
    }
    _.forEach(otherProjectFolderTypes, function(item) {
      item.state = 'close';
      item.render = item.depth === 1;
    });
  }

  docBrowser.filterList = function(selection) {
    $scope.filterSummary = undefined;
    $scope.filterDocs = {};
    $scope.filterLinage = {};
    $scope.filterDocs[selection.reference] = selection.label;
    $scope.filterLinage = selection.lineage;
    onFolderSelect(selection);
  };
  // Filter for review files
  docBrowser.rfilterList = function(selection) {
    $scope.rfilterSummary = undefined;
    $scope.rfilterDocs = {};
    $scope.rfilterDocs[selection.reference] = selection.label;
    $scope.rfilterLinage = {};
    $scope.rfilterLinage = selection.lineage;
  };

  docBrowser.filterDocsSelected = function(row) {
    if (!$scope.filterDocs) {
      return false;
    }
    if ( $scope.filterLinage === row.lineage ) {
      return true;
    }
    return false;
  };

  docBrowser.filterSummary = function(doc) {
    $scope.bytes = {};
    $scope.filterSummary = doc;
    $scope.filterSummary.MBytes = (doc.internalSize / Math.pow(1024, Math.floor(2))).toFixed(2);
    Document.getProjectDocumentVersions(doc._id).then( function(res) {
      docBrowser.docVersions	= res;
      $scope.$apply();
    });
  };
  docBrowser.rfilterSummary = function(doc) {
    $scope.rfilterSummary = doc;
    Document.getProjectDocumentVersions(doc._id).then( function(res) {
      docBrowser.docVersions	= res;
      $scope.$apply();
    });
  };
  docBrowser.downloadAndApprove = function(doc) {
    // TODO: Hook up the scraping code
    Document.downloadAndApprove(doc._id).then( function(/* res */) {
      // Update the table in the UI - call refresh
    });
  };

  // Removes the document from the collection
  docBrowser.deleteDocument = function(documentID) {
    Document.lookup(documentID)
      .then( function (doc) {
        return Document.getProjectDocumentVersions(doc._id);
      })
      .then( function (docs) {
        // Are there any prior versions?  If so, make them the latest and then delete
        // otherwise delete
        if (docs.length > 0) {
          return Document.makeLatestVersion(docs[docs.length-1]._id);
        } else {
          return null;
        }
      })
      .then( function () {
        // Remove link to the CollectionDocument
        return Document.deleteDocument(documentID);
      })
      .then( function(/* res */) {
        $scope.filterSummary = undefined;
        $rootScope.$broadcast('refreshDocumentList');
      });
  };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentLink.$inject = ['$rootScope', '$uibModalInstance', '$scope', 'rProject', 'rCurrent', 'rDocLocationCode', 'rArtifact', '_', 'rDocumentsControl'];
/* @ngInject */
function controllerModalDocumentLink($rootScope, $uibModalInstance, $scope, rProject, rCurrent, rDocLocationCode, rArtifact, _, rDocumentsControl) {
  var docLink = this;
  docLink.linkFiles = [];
  docLink.project = rProject;
  docLink.current = rCurrent;

  docLink.savedCurrent = angular.copy(rCurrent);
  docLink.docLocationCode = rDocLocationCode;
  docLink.artifact = rArtifact;

  var updateDocuments = function(data) {
    _.forEach(data, function(d) {
      if (!_.find(docLink.current, function(x) {return x === d;})) {
        docLink.current.push(d);
      }
    });
  };

  docLink.documentsControl = {
    add: function () {},
    remove: function () {},
    reset: function () {},
    update: updateDocuments
  };

  docLink.unlinkFile = function() {
    // do nothing, but why?
  };

  docLink.ok = function () {
    // tell the caller to update their document list...
    if (rDocumentsControl && rDocumentsControl.update) {
      rDocumentsControl.update(docLink.current);
    }
    $uibModalInstance.close();
  };

  docLink.cancel = function () {
    if (rDocumentsControl && rDocumentsControl.reset) {
      rDocumentsControl.reset(docLink.savedCurrent);
    }
    $uibModalInstance.dismiss('cancel');
  };
}

controllerModalPdfViewer.$inject = ['$uibModalInstance', '$scope', 'PDFViewerService', 'pdfobject', 'Document'];
/* @ngInject */
function controllerModalPdfViewer($uibModalInstance, $scope, pdf, pdfobject, Document) {
  $scope.pdfURL = window.location.protocol + "//" + window.location.host + "/api/document/" + pdfobject._id + "/fetch";
  $scope.instance = pdf.Instance("viewer");

  Document.lookup(pdfobject._id)
    .then(function (d) {
      $scope.documentName = d.displayName || d.documentFileName || d.internalOriginalName;
      $scope.$apply();
    });

  $scope.nextPage = function() {
    $scope.instance.nextPage();
  };

  $scope.prevPage = function() {
    $scope.instance.prevPage();
  };

  $scope.gotoPage = function(page) {
    $scope.instance.gotoPage(page);
  };

  $scope.pageLoaded = function(curPage, totalPages) {
    $scope.currentPage = curPage;
    $scope.totalPages = totalPages;
  };

  $scope.loadProgress = function(loaded, total, state) {
    if (state === 'loading') {
      $scope.loading = "Loading...";
    } else {
      $scope.loading = null;
    }
    $scope.$apply();
  };

  $scope.closeWindow = function () { $uibModalInstance.close(); };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentUploadClassify.$inject = ['$uibModalInstance', '$scope', 'rProject', 'rDocLocationCode', 'rArtifact', '$rootScope', 'rDocumentsControl'];
/* @ngInject */
function controllerModalDocumentUploadClassify($uibModalInstance, $scope, rProject, rDocLocationCode, rArtifact, $rootScope, rDocumentsControl) {
  var docUploadModal = this;
  docUploadModal.uploading = false;

  docUploadModal.enableUpload = false;

  var addDocument = function(data) {
    if (rDocumentsControl && rDocumentsControl.add) {
      rDocumentsControl.add(data);
    }
  };

  docUploadModal.documentsControl = {
    add: addDocument,
    remove: function () {},
    reset: function () {},
    update: function () {}
  };

  // Document upload complete so close and continue.
  $scope.$on('documentUploadCompleteF', function() {
    $uibModalInstance.close();
  });

  $scope.$on('enableUpload', function (event, args) {
    docUploadModal.enableUpload = args.enableUpload;
  });

  docUploadModal.project = rProject;
  docUploadModal.docLocationCode = rDocLocationCode;
  docUploadModal.artifact = rArtifact;

  docUploadModal.ok = function () {
    $scope.$broadcast('documentUploadStart', false);
    docUploadModal.uploading = true;
  };
  docUploadModal.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentUploadReview.$inject = ['$uibModalInstance', '$scope', 'rProject'];
/* @ngInject */
function controllerModalDocumentUploadReview($uibModalInstance, $scope, rProject) {
  var docUploadModalReview = this;

  // Document upload complete so close and continue.
  $scope.$on('documentUploadComplete', function() {
    $uibModalInstance.close();
  });

  docUploadModalReview.project = rProject;

  docUploadModalReview.ok = function () {
    $scope.$broadcast('documentUploadStart', true);
  };
  docUploadModalReview.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Documents Comment
//
// -----------------------------------------------------------------------------------
controllerModalDocumentViewer.$inject = ['$uibModalInstance'];
/* @ngInject */
function controllerModalDocumentViewer($uibModalInstance) {
  var md = this;
  md.ok = function () { $uibModalInstance.close(); };
  md.cancel = function () { $uibModalInstance.dismiss('cancel'); };
}

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: Signature Upload for User
//
// -----------------------------------------------------------------------------------
controllerSignatureUpload.$inject = ['UserModel', '$rootScope', '$scope', 'Upload', '$timeout', 'Document', '_', 'ENV', '$uibModalInstance'];
/* @ngInject */
function controllerSignatureUpload(UserModel, $rootScope, $scope, Upload, $timeout, Document, _, ENV, $uibModalInstance) {
  var sigUp = this;

  $scope.environment = ENV;

  sigUp.inProgress = false;
  sigUp.fileList = [];

  $scope.$watch('hideUploadButton', function(newValue) {
    if (newValue) {
      sigUp.hideUploadButton = newValue;
    }
  });

  sigUp.removeFile = function(f) {
    _.remove(sigUp.fileList, f);
  };

  $scope.$on('documentUploadComplete', function () {
    $rootScope.$broadcast('refreshSig');
    $uibModalInstance.close();
  });

  $scope.$watch('files', function (newValue) {
    if (newValue) {
      sigUp.inProgress = false;
      sigUp.fileList = [];
      sigUp.fileList.push(newValue[0]);
    }
  });

  sigUp.upload = function () {
    sigUp.inProgress = true;
    if (sigUp.fileList && sigUp.fileList.length) {
      angular.forEach( sigUp.fileList, function(file) {
        // Quick hack to pass objects
        file.upload = Upload.upload({
          url: '/api/users/sig/upload',
          file: file
        });

        file.upload.then(function (response) {
          $timeout(function () {
            file.result = response.data;
            UserModel.me()
              .then( function (me) {
                me.signature = file.result._id;
                return UserModel.save(me);
              })
              .then( function () {
                $scope.$emit('documentUploadComplete', file.result);
              });
          });
        }, function (response) {
          if (response.status > 0) {
            sigUp.errorMsg = response.status + ': ' + response.data;
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
// CONTROLLER: Modal: View Instructions for Documents Page
//
// -----------------------------------------------------------------------------------
controllerModalDocumentInstructions.$inject = ['$uibModalInstance'];
/* @ngInject */
function controllerModalDocumentInstructions($uibModalInstance) {
  var modal = this;

  modal.continue = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
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
      // If there is no extension, just return the original.
      var index = input.lastIndexOf(".");
      if (index !== -1 && (index >= input.length-5)) {
        var filename = input.substring(0, index);
        return filename; // ESM-724 Preserve file name case
      }
    }
    return input;
  };
}

filterDisplayFriendlyLocationCode.$inject = [];
/* @ngInject */
function filterDisplayFriendlyLocationCode() {
  return function(input) {
    var label = "";
    switch (input) {
    case 'main':
      label = "Main Document";
      break;
    case 'supporting':
      label = "Supporting Documents";
      break;
    case 'additional':
      label = "Additional Documents";
      break;
    case 'internal':
      label = "Internal Documents";
      break;
    }
    return label;
  };
}

filterBytes.$inject = [];
/* @ngInject */
function filterBytes() {
  return function(bytes, precision) {
    var units = [
      'bytes',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB'
    ];
    if ( isNaN( parseFloat( bytes )) || ! isFinite( bytes ) ) {
      return '?';
    }

    var unit = 0;

    while ( bytes >= 1024 ) {
      bytes /= 1024;
      unit ++;
    }

    return bytes.toFixed( + precision ) + ' ' + units[ unit ];
  };
}
