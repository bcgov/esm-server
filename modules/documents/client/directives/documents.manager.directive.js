'use strict';

angular.module('documents')
  .directive('documentMgr', ['_', 'AlertService', 'FolderModel', function (_, AlertService, FolderModel) {
    return {
      restrict: 'E',
      scope: {
        project: '=',
        file: '=',
        folder: '='
      },
      templateUrl: 'modules/documents/client/views/document-manager.html',
      controller: function ($scope, $log, _, moment, Authentication, DocumentMgrService, MinioService, CodeLists, TreeModel, ProjectModel, Document, CollectionModel) {
        var tree = new TreeModel();
        var self = this;
        self.busy = true;
        self.requestOpenDir = null;
        self.requestOpenFileID = null;

        $scope.copyClipboardSuccess = function(e) {
          var txt = e.trigger.getAttribute('data-doc-name');
          AlertService.success('Link copied for ' + txt, 4000);
          e.clearSelection();
        };

        $scope.copyClipboardError = function() {
          AlertService.error('Copy link failed.');
        };

        if ($scope.file) {
          self.requestOpenFileID = $scope.file; // objectId
        }
        if ($scope.folder) {
          try {
            self.requestOpenDir = parseInt($scope.folder); // tree Id
          } catch (e) {
            // swallow error
          }
        }

        $scope.authentication = Authentication;
        $scope.documentTypes = CodeLists.documentTypes;

        ProjectModel.getProjectDirectory($scope.project)
          .then( function (dir) {
            $scope.project.directoryStructure = dir || {
              id: 1,
              lastId: 1,
              name: 'ROOT',
              published: true
            };
            self.rootNode = tree.parse($scope.project.directoryStructure);
            if (self.requestOpenDir) {
              self.selectNode(self.requestOpenDir);
            } else if (self.requestOpenFileID) {
              self.gotoDoc(self.requestOpenFileID);
            } else {
              self.selectNode(self.rootNode);
            }

            $scope.$apply();
          });

        // default sort is by name ascending...
        self.sorting = {
          column: 'name',
          ascending: true
        };

        // self.rootNode = tree.parse($scope.project.directoryStructure);
        self.selectedNode = undefined;
        self.currentNode = undefined;
        self.currentPath = undefined;

        self.allChecked = false;
        self.checkedDirs = [];
        self.checkedFiles = [];
        self.lastChecked = {fileId: undefined, directoryID: undefined};

        self.currentFiles = [];
        self.currentDirs = [];
        self.customSorter = {};

        self.batchMenuEnabled = false;

        self.infoPanel = {
          open: false,
          type: 'None',
          data: undefined,
          toggle: function() {
            self.infoPanel.open = !self.infoPanel.open;
          },
          close: function() {
            self.infoPanel.open = false;
          },
          reset: function() {
            //self.infoPanel.enabled = false;
            //self.infoPanel.open = false;
            self.infoPanel.type = 'None';
            self.infoPanel.data = undefined;
            self.infoPanel.link = undefined;
          },
          setData: function() {
            self.infoPanel.reset();
            // check to see if there is a single lastChecked item set first...
            if (self.lastChecked) {
              if (self.lastChecked.fileId) {
                self.infoPanel.type = 'File';
                var file = _.find(self.currentFiles, function(o) { return o._id.toString() === self.lastChecked.fileId; });
                self.infoPanel.data = file ? file : undefined;
                self.infoPanel.link = window.location.protocol + '//' + window.location.host + '/api/document/'+ file._id+'/fetch';
              } else if (self.lastChecked.directoryID) {
                self.infoPanel.type = 'Directory';
                var node =_.find(self.currentDirs, function(o) { return o.model.id === self.lastChecked.directoryID; });
                self.infoPanel.data = node ? node.model : undefined;
              }
            } else {
              if (_.size(self.checkedDirs) + _.size(self.checkedFiles) > 1) {
                self.infoPanel.type = 'Multi';
                self.infoPanel.data = {
                  checkedFiles: _.size(self.checkedFiles),
                  checkedDirs: _.size(self.checkedDirs),
                  totalFiles: _.size(self.currentFiles),
                  totalDirs: _.size(self.currentDirs)
                }; // what to show here?
              }
            }
          }
        };

        self.sortBy = function(column) {
          //is this the current column?
          if (self.sorting.column.toLowerCase() === column.toLowerCase()){
            //so we reverse the order...
            self.sorting.ascending = !self.sorting.ascending;
          } else {
            // changing column, set to ascending...
            self.sorting.column = column.toLowerCase();
            self.sorting.ascending = true;
          }
          self.applySort();
        };

        self.applySort = function() {
          var direction = self.sorting.ascending ? 1 : -1;
          var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
          if (self.sorting.column === 'name') {
            self.currentFiles.sort(function (d1, d2) {
              var v = collator.compare(d1.displayName, d2.displayName);
              return v * direction;
            });
            self.currentDirs.sort(function (d1, d2) {
              var v = collator.compare(d1.model.name, d2.model.name);
              return v * direction;
            });
          } else if (self.sorting.column === 'date') {
            self.currentFiles.sort(function(doc1, doc2){
              var d1 = doc1.documentDate || 0;
              var d2 = doc2.documentDate || 0;
              return (new Date(d1) - new Date(d2)) * direction;
            });
          } else if (self.sorting.column === 'pub') {
            self.currentFiles.sort(function(doc1, doc2){
              var d1 = doc1.isPublished ? 1 : 0;
              var d2 = doc2.isPublished ? 1 : 0;
              return (d1 - d2) * direction;
            });
          } else if (self.sorting.column === 'custom') {
            self.currentFiles.sort(function(doc1, doc2){
              return (doc1.order - doc2.order);
            });
            self.currentDirs.sort(function(doc1, doc2){
              var f1 = doc1.model.folderObj, f2 = doc2.model.folderObj;
              if (f1 && f2) {
                return (f1.order - f2.order);
              }
              return 0;
            });
          }
        };

        self.checkAll = function() {
          _.each(self.currentDirs, function(o) { o.selected = self.allChecked; });
          _.each(self.currentFiles, function(o) { o.selected = self.allChecked; });

          var doc;
          if (self.allChecked) {
            doc = _.last(self.currentFiles) || _.last(self.currentDirs);
          }

          self.syncCheckedItems(doc);
        };

        self.checkFile = function(doc) {
          // ADD/remove to the selected file list...
          self.syncCheckedItems(doc);
        };
        self.selectFile = function(doc) {
          // selected a file, make it the only item selected...
          var checked = doc.selected;
          _.each(self.currentDirs, function(o) { o.selected = false; });
          _.each(self.currentFiles, function(o) { o.selected = false; });
          doc.selected = !checked;
          self.syncCheckedItems(doc);
        };

        self.dblClick = function(doc){
          var safeName = doc.displayName.replace(/ /g,"_");
          var pdfURL = window.location.protocol + "//" + window.location.host + "/api/document/" + doc._id + "/fetch/" + safeName;
          window.open(pdfURL, "_blank");
        };

        self.checkDir = function(doc) {
          self.syncCheckedItems(doc);
        };
        self.selectDir = function(doc) {
          // selected a dir, make it the only item selected...
          var checked = doc.selected;
          _.each(self.currentDirs, function(o) { o.selected = false; });
          _.each(self.currentFiles, function(o) { o.selected = false; });
          doc.selected = !checked;
          self.syncCheckedItems(doc);
        };
        self.openDir = function(doc) {
          //double clicked a dir, open it up!
          self.selectNode(doc.model.id);
        };

        self.gotoDoc = function(docID) {
          Document.lookup(docID) //docID is an objectID
            .then(function (doc) {
              self.selectNode(doc.directoryID, docID);
            });
        };

        // Select folder based on tree id (directoryID). If docID is present then select this doc.
        self.selectNode = function (nodeId, docID) {
          self.busy = true;
          var theNode = self.rootNode.first(function (n) {
            return n.model.id === nodeId;
          });
          if (!theNode) {
            theNode = self.rootNode;
          }

          self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
          self.folderURL = window.location.protocol + "//" + window.location.host + "/p/" + $scope.project.code + "/docs?folder=" + self.currentNode.model.id;
          //self.currentPath = theNode.getPath() || [];
          self.currentFiles = [];
          self.currentDirs = [];

          var pathArray = theNode.getPath();
          _.each(pathArray, function (elem) {
            if (elem.model.id > 1) { //bail the root node cus we don't need to attatch the folderObj to it
              if (!elem.model.hasOwnProperty('folderObj')) { //trying to reduce the amount of API calls only by checking if node model does not have folderObj
                FolderModel.lookup($scope.project._id, elem.model.id)
                  .then(function (folder) {
                    elem.model.folderObj = folder;
                  });
              }
            }
          });
          self.currentPath = pathArray || [];
          // path is published IFF all nodes are not unpublished.  This find returns first unpublished element.
          self.currentPathIsPublished = (undefined === _.find(self.currentPath, function(p) { return ! p.model.published; }));
          self.currentPathIsPublishedWarning = self.currentPathIsPublished ? null : "You will need to publish all parent folders to fully publish these document(s).";

          //$log.debug('currentNode (' + self.currentNode.model.name + ') get documents...');
          DocumentMgrService.getDirectoryDocuments($scope.project, self.currentNode.model.id)
            .then(
              function (result) {
              //$log.debug('...currentNode (' + self.currentNode.model.name + ') got '+ _.size(result.data ) + '.');

                self.currentFiles = _.map(result.data, function(f) {
                // making sure that the displayName is set...
                  if (_.isEmpty(f.displayName)) {
                    f.displayName = f.documentFileName || f.internalOriginalName;
                  }
                  f.link = window.location.protocol + '//' + window.location.host + '/api/document/'+ f._id+'/fetch';

                  if (_.isEmpty(f.dateUploaded) && !_.isEmpty(f.oldData)) {
                    var od = JSON.parse(f.oldData);
                    try {
                      f.dateUploaded = moment(od.WHEN_CREATED, "MM/DD/YYYY HH:mm").toDate();
                    } catch(ex) {
                      // swallow error
                    }
                  }
                  if (_.isEmpty(f.documentDate)){
                    f.documentDate = f.dateUploaded;
                  }
                  return _.extend(f,{selected:  (_.find(self.checkedFiles, function(d) { return d._id.toString() === f._id.toString(); }) !== undefined), type: 'File'});
                });

                self.currentDirs = _.map(self.currentNode.children, function (n) {
                  return _.extend(n,{selected: (_.find(self.checkedDirs, function(d) { return d.model.id === n.model.id; }) !== undefined), type: 'Directory'});
                });

                if (self.currentNode.model && self.currentNode.model.folderObj) {
                  var sortField = self.currentNode.model.folderObj.defaultSortField || 'name';
                  var sortDirection = self.currentNode.model.folderObj.defaultSortDirection || 'asc';
                  self.sorting.column = sortField;
                  self.sorting.ascending = sortDirection === 'asc';
                }

                if (docID) {
                // search in the folder's document list to locate the target document
                  _.each(self.currentFiles, function(doc) {
                    if (doc._id === docID) {
                      self.selectFile(doc);
                      return;
                    }
                  });
                } else {
                // otherwise selected node (folder)
                  self.selectedNode = self.currentNode;
                }

                // update the custom sorted ready for it to be opened
                self.customSorter.documents = self.currentFiles;
                self.customSorter.folders = self.currentDirs;
                self.customSorter.sorting = self.sorting;

                // see what is currently checked
                self.syncCheckedItems();
                self.busy = false;
              },
              function (error) {
                $log.error('getDirectoryDocuments error: ', JSON.stringify(error));
                self.busy = false;
              }
            ).then(function () {
            // Go through each of the currently available folders in view, and attach the object
            // to the model dynamically so that the permissions directive will work by using the
            // correct x-object=folderObject instead of a doc.
              return FolderModel.lookupForProjectIn($scope.project._id, self.currentNode.model.id)
                .then(function (folder) {
                  _.each(folder, function (fs) {
                    // We do breadth-first because we like to talk to our neighbours before moving
                    // onto the next level (where we bail for performance reasons).
                    theNode.walk({strategy: 'breadth'}, function (n) {
                      if (n.model.id === fs.directoryID) {
                        n.model.folderObj = fs;
                        return false;
                      }
                    });
                  });
                  $scope.$apply();
                });
            })
            .then(function() {
            // everything is ready.  In particular the directoryStructure models have the most current folderObj
            // so we can perform custom sort if needed.
              self.applySort();
            });
        };

        self.defaultSortOrderChanged = function() {
          self.selectNode(self.currentNode.model.id);
        };

        self.syncCheckedItems = function(doc) {
          self.checkedDirs = _.filter(self.currentDirs, function(o) { return o.selected; }) || [];
          self.checkedFiles = _.filter(self.currentFiles, function(o) { return o.selected; }) || [];
          // any kind of contexts that depend on what is selected needs to be done here too...
          self.lastChecked = undefined;
          if (doc && doc.selected && (_.size(self.checkedDirs) + _.size(self.checkedFiles) === 1)){
            if (doc.model) {
              self.lastChecked = { directoryID: doc.model.id, fileId: undefined };
            } else {
              self.lastChecked = { directoryID: undefined, fileId: doc._id.toString() };
            }
          }
          if (!doc && (_.size(self.checkedDirs) + _.size(self.checkedFiles) === 1)){
            // if no doc passed in, but there is a single selected item, make it lastSelected
            // most probable case is a selectNode after a context menu operation...
            if (_.size(self.checkedDirs) === 1) {
              self.lastChecked = { directoryID: self.checkedDirs[0].model.id, fileId: undefined };
            } else {
              self.lastChecked = { directoryID: undefined, fileId: self.checkedFiles[0]._id.toString() };
            }
          }
          self.infoPanel.setData();
          self.deleteSelected.setContext();
          self.publishSelected.setContext();
          self.moveSelected.setContext();

          // in the batch menu, we have some folder management and publish/unpublish of files.
          // so user needs to be able to manage folders, or have some selected files they can pub/unpub
          self.batchMenuEnabled = ($scope.project.userCan.manageFolders && _.size(self.checkedDirs) > 0) || _.size(self.publishSelected.publishableFiles) > 0 || _.size(self.publishSelected.unpublishableFiles) > 0;
        };

        // Removes the reference data required by the document manager to display the document in the file tree,
        // and then removes the file from the storage.
        self.deleteDocument = function(documentID) {
          var collections = null;
          var docName = null;

          return Document.lookup(documentID)
            .then(function(doc) {
              docName = doc.internalName;
              collections = doc.collections;
              return Document.getProjectDocumentVersions(doc._id);
            })
            .then(function(docs) {
              // Are there any prior versions?  If so, make them the latest and then delete
              // otherwise delete
              if (docs.length > 0) {
                return Document.makeLatestVersion(docs[docs.length-1]._id);
              } else {
                return null;
              }
            })
            .then(function() {
              // EPIC-1259: If there are there any collections associated with this document,
              // then delete the collection document reference in the collections as well.
              var promises = _.union(_.map(collections, function(c) {
                return CollectionModel.removeOtherDocument(c._id, documentID);
              }), _.map(collections, function(c) {
                return CollectionModel.removeMainDocument(c._id, documentID);
              }));
              return Promise.all(promises);
            })
            .then(function () {
              // Delete the document from the document manager database reference tables
              return Document.deleteDocument(documentID);
            })
            .then(function () {
              // Delete the document from the storage
              MinioService.deleteMinioDocument($scope.project.code, docName);
            })
            .catch (function() {
              AlertService.error('The document could not be deleted.');
            });
        };

        self.deleteSelected = {
          confirmItems: [],
          setContext: function() {
            self.deleteSelected.confirmItems = [];
            _.each(self.checkedDirs, function(o) {
              if ($scope.project.userCan.manageFolders) {
                self.deleteSelected.confirmItems.push(o.model.name);
              }
            });
            _.each(self.checkedFiles, function(o) {
              if (o.userCan.delete) {
                self.deleteSelected.confirmItems.push(o.displayName);
              }
            });
          }
        };

        // callback invoked by delete directive once user confirms delete
        self.deleteFilesAndDirs = function(deletableFolders, deletableFiles) {
          self.busy = true;

          var dirPromises = _.map(deletableFolders, function(d) {
            return DocumentMgrService.removeDirectory($scope.project, d);
          });

          var filePromises = _.map(deletableFiles, function(f) {
            return self.deleteDocument(f._id);
          });

          var directoryStructure;
          return Promise.all(dirPromises)
            .then(function(result) {
              if (!_.isEmpty(result)) {
                var last = _.last(result);
                directoryStructure = last.data;
              }
              return Promise.all(filePromises);
            })
            .then(function(/* result */) {
              if (directoryStructure) {
                $scope.project.directoryStructure = directoryStructure;
                $scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
              }
              self.selectNode(self.currentNode.model.id);
              self.busy = false;
              AlertService.success('The selected items were deleted.', 4000);
            }, function(/* err */) {
              self.busy = false;
              AlertService.error('The selected items could not be deleted.', 4000);
            });
        };

        // Publish

        self.publishFilesAndDirs = function(files, dirs) {
          self.busy = true;
          self.dirCount = 0;
          self.fileCount = 0;

          var filePromises = _.map(files, function(f) {
            return Document.publish(f)
              .then(function(/* result */) {
                self.fileCount++;
                f.isPublished = true;
              }, function(/* err */) {
                AlertService.error('File "' + (f.displayName || f.documentFileName || f.internalOriginalName) + '" could not be published.', 4000);
              });
          });

          var dirPromises = _.map(dirs, function(d) {
            return ProjectModel.publishDirectory($scope.project, d.model.id)
              .then(function(/* result */) {
                self.dirCount++;
                d.model.published = true;
              }, function(/* err */) {
                AlertService.error('Folder "' + d.model.name + '" could not be published.', 4000);
              });
          });

          return Promise.all(dirPromises)
            .then(function(/* result */) {
              if (_.size(dirs) > 0) {
                self.selectNode(self.currentNode.model.id);
                AlertService.success(self.dirCount + ' of ' + _.size(dirs) + ' folders ' + (self.dirCount != 1 ? 'were' : 'was') + ' successfully published.', 4000);
              }
            })
            .then(function() {
              return Promise.all(filePromises);
            })
            .then(function(/* result */) {
              if (_.size(files) > 0) {
                self.selectNode(self.currentNode.model.id);
                AlertService.success(self.fileCount + ' of ' + _.size(files) + ' files ' + (self.dirCount != 1 ? 'were' : 'was') + ' successfully published.', 4000);
              }
              self.busy = false;
            });
        };

        self.unpublishFilesAndDirs = function(files, dirs) {
          self.busy = true;
          self.dirCount = 0;
          self.fileCount = 0;

          var filePromises = _.map(files, function(f) {
            return Document.unpublish(f)
              .then(function(/* result */) {
                self.fileCount++;
                f.isPublished = false;
              }, function(/* err */) {
                AlertService.error('File "' + (f.displayName || f.documentFileName || f.internalOriginalName) + '" could not be unpublished.', 4000);
              });
          });
          var dirPromises = _.map(dirs, function(d) {
            return ProjectModel.unpublishDirectory($scope.project, d.model.id)
              .then(function(/* result */) {
                self.dirCount++;
                d.model.published = false;
              }, function(/* err */) {
                AlertService.error('Folder "' + d.model.name + '" could not be unpublished.', 4000);
              });
          });

          return Promise.all(dirPromises)
            .then(function(/* result */) {
              if (_.size(dirs) > 0) {
                self.selectNode(self.currentNode.model.id);
                AlertService.success(self.dirCount + ' of ' + _.size(dirs) + ' folders ' + (self.dirCount != 1 ? 'were' : 'was') + ' successfully unpublished.', 4000);
              }
            })
            .then(function() {
              return Promise.all(filePromises);
            })
            .then(function(/* result */) {
              if (_.size(files) > 0) {
                self.selectNode(self.currentNode.model.id);
                AlertService.success(self.fileCount + ' of ' + _.size(files) + ' files ' + (self.dirCount != 1 ? 'were' : 'was') + ' successfully unpublished.', 4000);
              }
              self.busy = false;
            });
        };

        self.publishFolder = function(folder) {
          return self.publishFilesAndDirs([], [folder]);
        };

        self.unpublishFolder = function(folder) {
          return self.unpublishFilesAndDirs([], [folder]);
        };

        self.publishFile = function(file) {
          return self.publishFilesAndDirs([file], []);
        };

        self.unpublishFile = function(file) {
          return self.unpublishFilesAndDirs([file],[]);
        };

        self.publishSelected = {
          publish: function() {
            return self.publishFilesAndDirs(self.publishSelected.publishableFiles, self.publishSelected.publishableDirs);
          },
          unpublish: function() {
            return self.unpublishFilesAndDirs(self.publishSelected.unpublishableFiles, self.publishSelected.unpublishableDirs);
          },
          cancel: undefined,
          confirmPublishItems: [],
          confirmUnpublishItems: [],
          publishableFiles: [],
          unpublishableFiles: [],
          publishableDirs: [],
          unpublishableDirs: [],
          setContext: function() {
            self.publishSelected.confirmPublishItems = [];
            self.publishSelected.confirmUnpublishItems = [];
            self.publishSelected.publishableFiles = [];
            self.publishSelected.unpublishableFiles = [];
            self.publishSelected.publishableDirs = [];
            self.publishSelected.unpublishableDirs = [];

            // documents/files
            _.each(self.checkedFiles, function(o) {
              var name = o.displayName || o.documentFileName || o.internalOriginalName;
              if (o.userCan.publish && !o.isPublished) {
                self.publishSelected.publishableFiles.push(o);
                self.publishSelected.confirmPublishItems.push(name);
              }
              if (o.userCan.unPublish && o.isPublished) {
                self.publishSelected.unpublishableFiles.push(o);
                self.publishSelected.confirmUnpublishItems.push(name);
              }
            });

            // folders
            if ($scope.project.userCan.manageFolders) {
              _.each(self.checkedDirs, function(o) {
                if (o.model.published) {
                  self.publishSelected.unpublishableDirs.push(o);
                  self.publishSelected.confirmUnpublishItems.push(o.model.name);
                } else {
                  self.publishSelected.publishableDirs.push(o);
                  self.publishSelected.confirmPublishItems.push(o.model.name);
                }
              });
            }
          }
        };

        self.moveSelected = {
          titleText: 'Move File(s)',
          okText: 'Yes',
          cancelText: 'No',
          ok: function(destination) {
            if (!destination) {
              return Promise.reject('Destination required for moving files and folders.');
            } else {
              //Check destination directory for folders of identical name to selected folder(s).
              var repeat = _.find(self.moveSelected.moveableFolders, function(srcFolder) {
                return _.find(destination.children, function(destFolder) {
                  return destFolder.model.name === srcFolder.model.name;
                });
              });
              //If repeat name found, throw error. Otherwise, continue with move.
              if (repeat) {
                AlertService.error('Folder name ' + repeat.model.name + ' already exists in ' + destination.model.name);
              } else {var dirs = _.size(self.checkedDirs);
                var files = _.size(self.checkedFiles);
                if (dirs === 0 && files === 0) {
                  return Promise.resolve();
                } else {
                  self.busy = true;

                  var filePromises = _.map(self.moveSelected.moveableFiles, function (f) {
                    f.directoryID = destination.model.id;
                    return Document.save(f);
                  });
                  var directoryStructure;
                  // promise to move files and folders
                  return new Promise(function (resolve, reject) {
                    var promise = Promise.resolve(null);
                    var count = _.size(self.moveSelected.moveableFolders);
                    if (count > 0) { // we have this counter to check if there is only files that need to be moved i.e execute only if the folder array size > 0
                      //loop to move files sequentially
                      self.moveSelected.moveableFolders.forEach(function (value) {
                        promise = promise.then(function () {
                          return DocumentMgrService.moveDirectory($scope.project, value, destination);
                        })
                          .then(function (newValue) {
                            count--;
                            if (count === 0) {
                              resolve(newValue);
                            }
                          });
                      });
                      promise = promise.catch(reject); //finish promise chain with an error handler
                    }
                    else {
                      resolve(null); //if no folders
                    }
                  })
                    .then(function (result) {
                      if (!_.isEmpty(result)) {
                        directoryStructure = result.data;
                      }
                      return Promise.all(filePromises);
                    })
                    .then(function (/* result */) {
                      if (directoryStructure) {
                        $scope.project.directoryStructure = directoryStructure;
                        $scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
                      }
                      self.selectNode(destination.model.id);
                      AlertService.success('The selected items were moved.', 4000);
                    })
                    .catch(function (/* err */) {
                      self.busy = false;
                      AlertService.error('The selected items could not be moved.', 4000);
                    });
                }
              }
            }
          },
          cancel: undefined,
          confirmText:  'Are you sure you want to move the selected item(s)?',
          confirmItems: [],
          moveableFolders: [],
          moveableFiles: [],
          setContext: function() {
            self.moveSelected.confirmItems = [];
            self.moveSelected.titleText = 'Move selected';
            self.moveSelected.confirmText = 'Are you sure you want to move the following the selected item(s)?';
            var dirs = _.size(self.checkedDirs);
            var files = _.size(self.checkedFiles);
            if (dirs > 0 && files > 0) {
              self.moveSelected.titleText = 'Move Folder(s) and File(s)';
              self.moveSelected.confirmText = 'Are you sure you want to move the following ('+ dirs +') folders and ('+ files +') files?';
            } else if (dirs > 0) {
              self.moveSelected.titleText = 'Move Folder(s)';
              self.moveSelected.confirmText = 'Are you sure you want to move the following ('+ dirs +') selected folders?';
            } else if (files > 0) {
              self.moveSelected.titleText = 'Move File(s)';
              self.moveSelected.confirmText = 'Are you sure you want to move the following ('+ files +') selected files?';
            }

            self.moveSelected.confirmItems = [];
            self.moveSelected.moveableFolders = [];
            self.moveSelected.moveableFiles = [];

            _.each(self.checkedDirs, function(o) {
              if ($scope.project.userCan.manageFolders) {
                self.moveSelected.confirmItems.push(o.model.name);
                self.moveSelected.moveableFolders.push(o);
              }
            });
            _.each(self.checkedFiles, function(o) {
              if (o.userCan.write) {
                var name = o.displayName || o.documentFileName || o.internalOriginalName;
                self.moveSelected.confirmItems.push(name);
                self.moveSelected.moveableFiles.push(o);
              }
            });

          }
        };

        self.onPermissionsUpdate = function() {
          self.selectNode(self.currentNode.model.id);
        };

        self.onDocumentUpdate = function() {
          // should refresh the table and the info panel...
          self.selectNode(self.currentNode.model.id);
        };

        self.updateCollections = function(collections, documents) {
          var promises = [];
          if (_.isArray(documents)) {
            // Add the documents to the selected collections
            _.each(documents, function(d) {
              _.each(collections, function(c) {
                // This is have no effect if the document is already in the collection.
                promises.push(CollectionModel.addOtherDocument(c._id, d._id));
              });
            });
            return Promise.all(promises).then(function() {
              AlertService.success('The document' + (documents.length > 1 ? 's were' : ' was') + ' successfully added to the collection' + (collections.length > 1 ? 's.' : '.'), 4000);
            }, function(err) {
              AlertService.error('The document' + (documents.length > 1 ? 's were' : ' was') + ' not added to the collection' + (collections.length > 1 ? 's: ' : ': ') + err.message);
            });
          } else {
            // Update (add/remove) the collections for this document
            var original = documents.collections;

            // Find added collections
            var added = _.filter(collections, function(c) {
              return !_.find(original, function(o) { return o._id === c._id; });
            });

            // Find removed collections
            var removed = _.filter(original, function(o) {
              return !_.find(collections, function(c) { return o._id === c._id; });
            });
            // Updating collections:
            // Addition - only other documents
            // Removal - check main and other documents
            promises = _.union(_.map(added, function(c) {
              return CollectionModel.addOtherDocument(c._id, documents._id);
            }), _.map(removed, function(c) {
              return CollectionModel.removeMainDocument(c._id, documents._id);
            }));
            // EPIC - 1215 Collections (info panel) do not get updated when removed from the document
            // Dealing seperately with removal of documents (associated with the appropriate collections) here
            // because saving documents after removing collections
            // does not take into consideration the fact that the collections could be updated by something else
            //Therefore, we serialize promises such that removal of one document only happens after the removal of another document.
            var chain = _.reduce(removed, function(previousPromise, currentCollectionElement) {
              return previousPromise.then(function() {
                return CollectionModel.removeOtherDocument(currentCollectionElement._id, documents._id);
              });
            }, Promise.resolve());
            promises.push(chain);
            return Promise.all(promises).then(function() {
              AlertService.success('The document\'s collections were successfully updated.', 4000);
            }, function(err) {
              AlertService.error('The document\'s collections were not successfully updated: '+ err.message);
            });
          }
        };

        $scope.$on('documentMgrRefreshNode', function (event, args) {
          if (args.nodeId) {
            // Refresh the node
            self.selectNode(args.nodeId);
          } else {
            self.rootNode = tree.parse(args.directoryStructure);
            self.selectNode(self.currentNode.model.id);
          }
        });
      },
      controllerAs: 'documentMgr'
    };
  }]);

