'use strict';
angular.module('documents')

	.directive('documentMgr', ['_', 'moment', 'Authentication', 'DocumentMgrService', 'AlertService', 'ConfirmService', 'CodeLists', 'TreeModel', 'ProjectModel', 'Document', 'FolderModel', 'CollectionModel', function (_, moment, Authentication, DocumentMgrService, AlertService, ConfirmService, CodeLists, TreeModel, ProjectModel, Document, FolderModel, CollectionModel) {
		return {
			restrict: 'E',
			scope: {
				project: '=',
				file: '=',
				folder: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager.html',
			controller: function ($scope, $filter, $log, $modal, $timeout, _, moment, Authentication, DocumentMgrService, CodeLists, TreeModel, ProjectModel, Document, CollectionModel) {
				var tree = new TreeModel();
				var self = this;
				self.busy = true;
				self.requestOpenDir = null;
				self.requestOpenFileID = null;

				$scope.copyClipboardSuccess = function(e) {
					var txt = e.trigger.getAttribute('data-doc-name');
					AlertService.success('Link copied for ' + txt);
					e.clearSelection();
				};

				$scope.copyClipboardError = function(e) {
					AlertService.error('Copy link failed.');
				};

				if ($scope.file) {
					self.requestOpenFileID = $scope.file; // objectId
				}
				if ($scope.folder) {
					try {
						self.requestOpenDir = parseInt($scope.folder); // tree Id
					} catch (e) {
						console.log("couldn't parse directory");
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
								self.infoPanel.link =  window.location.protocol + '//' + window.location.host + '/api/document/'+ file._id+'/fetch';
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
							var d1 = doc1.dateUploaded || 0;
							var d2 = doc2.dateUploaded || 0;
							return (new Date(d1) - new Date(d2)) * direction;
						});
					} else if (self.sorting.column === 'pub') {
						self.currentFiles.sort(function(doc1, doc2){
							var d1 = doc1.isPublished ? 1 : 0;
							var d2 = doc2.isPublished ? 1 : 0;
							return (d1 - d2) * direction;
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
					var pdfURL = window.location.protocol + "//" + window.location.host + "/api/document/" + doc._id + "/fetch";
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
								f.link =  window.location.protocol + '//' + window.location.host + '/api/document/'+ f._id+'/fetch';

								if (_.isEmpty(f.dateUploaded) && !_.isEmpty(f.oldData)) {
									var od = JSON.parse(f.oldData);
									//console.log(od);
									try {
										f.dateUploaded = moment(od.WHEN_CREATED, "MM/DD/YYYY HH:mm").toDate();
									} catch(ex) {
										console.log('Error parsing WHEN_CREATED from oldData', JSON.stringify(f.oldData));
									}
								}
								return _.extend(f,{selected:  (_.find(self.checkedFiles, function(d) { return d._id.toString() === f._id.toString(); }) !== undefined), type: 'File'});
							});

							self.currentDirs = _.map(self.currentNode.children, function (n) {
								return _.extend(n,{selected: (_.find(self.checkedDirs, function(d) { return d.model.id === n.model.id; }) !== undefined), type: 'Directory'});
							});

							self.applySort();

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
						FolderModel.lookupForProjectIn($scope.project._id, self.currentNode.model.id)
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
					});
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

				self.deleteDocument = function(documentID) {
					return Document.lookup(documentID)
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
							// Delete it from the system.
							return Document.deleteDocument(documentID);
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
						// console.log("Delete folders result", result);
						//$log.debug('Dir results ', JSON.stringify(result));
						if (!_.isEmpty(result)) {
							var last = _.last(result);
							directoryStructure = last.data;
						}
						return Promise.all(filePromises);
					})
					.then(function(result) {
						//$log.debug('File results ', JSON.stringify(result));
						if (directoryStructure) {
							//$log.debug('Setting the new directory structure...');
							$scope.project.directoryStructure = directoryStructure;
							$scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
						}
						//$log.debug('Refreshing current directory...');
						self.selectNode(self.currentNode.model.id);
						self.busy = false;
						AlertService.success('The selected items were deleted.');
					}, function(err) {
						console.log("err result", err);
						self.busy = false;
						AlertService.error('The selected items could not be deleted.');
					});
				};

				self.publishFiles = function(files) {
					self.busy = true;
					var filePromises = _.map(files, function(f) {
						return Document.publish(f);
					});
					return Promise.all(filePromises)
						.then(function(result) {
							//$log.debug('Publish File results ', JSON.stringify(result));
							//$log.debug('Refreshing current directory...');
							var published = _.map(result, function(o) { if (o.isPublished) return o.displayName || o.documentFileName || o.internalOriginalName; });
							var unpublished = _.map(result, function(o) { if (!o.isPublished) return o.displayName || o.documentFileName || o.internalOriginalName; });
							self.selectNode(self.currentNode.model.id);
							AlertService.success(_.size(published) + ' of ' + _.size(files) + ' files successfully published.');
						}, function(err) {
							self.busy = false;
							AlertService.error('The selected files could not be published.');
						});
				};

				self.unpublishFiles = function(files) {
					self.busy = true;
					var filePromises = _.map(files, function(f) {
						return Document.unpublish(f);
					});
					return Promise.all(filePromises)
						.then(function(result) {
							//$log.debug('Unpublish File results ', JSON.stringify(result));
							//$log.debug('Refreshing current directory...');
							var published = _.map(result, function(o) { if (o.isPublished) return o.displayName || o.documentFileName || o.internalOriginalName; });
							var unpublished = _.map(result, function(o) { if (!o.isPublished) return o.displayName || o.documentFileName || o.internalOriginalName; });
							self.selectNode(self.currentNode.model.id);
							AlertService.success(_.size(unpublished) + ' of ' + _.size(files) + ' files successfully unpublished.');
						}, function(err) {
							self.busy = false;
							AlertService.error('The selected files could not be unpublished.');
						});
				};

				self.publishFolder = function(folder) {
					self.busy = true;
					return ProjectModel.publishDirectory($scope.project, folder.model.id)
						.then(function (directoryStructure) {
							$scope.project.directoryStructure = directoryStructure;
							$scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
							AlertService.success(folder.model.name + ' folder successfully published.');
						}, function () {
							self.busy = false;
							AlertService.error('The selected folder could not be published.');
						});
				};

				self.unpublishFolder = function(folder) {
					self.busy = true;
					return ProjectModel.unpublishDirectory($scope.project, folder.model.id)
						.then(function (directoryStructure) {
							$scope.project.directoryStructure = directoryStructure;
							$scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
							AlertService.success(folder.model.name + ' folder successfully un-published.');
						}, function (docs) {
							var theDocs = [];
							var msg = "";
							if (docs.message && docs.message[0] && docs.message[0].documentFileName) {
								_.each(docs.message, function (d) {
									theDocs.push(d.documentFileName);
								});
								msg = 'This action cannot be completed as the following documents are published: ' + theDocs + '.  Please unpublish each document and attempt your action again.';
							} else {
								msg = "Couldn't complete operation.";
							}
							self.busy = false;
							AlertService.error(msg);
						});
				};

				self.publishFile = function(file) {
					return self.publishFiles([file]);
				};

				self.unpublishFile = function(file) {
					return self.unpublishFiles([file]);
				};

				self.publishSelected = {
					titleText: 'Publish File(s)',
					okText: 'Yes',
					cancelText: 'No',
					publish: function() {
						return self.publishFiles(self.publishSelected.publishableFiles);
					},
					unpublish: function() {
						return self.unpublishFiles(self.publishSelected.unpublishableFiles);
					},
					cancel: undefined,
					confirmText:  'Are you sure you want to publish the selected item(s)?',
					confirmItems: [],
					publishableFiles: [],
					unpublishableFiles: [],
					setContext: function() {
						self.publishSelected.confirmItems = [];
						self.publishSelected.publishableFiles = [];
						self.publishSelected.unpublishableFiles = [];
						// only documents/files....
						_.each(self.checkedFiles, function(o) {
							var canDoSomething = false;
							if (o.userCan.publish) {
								canDoSomething = true;
								self.publishSelected.publishableFiles.push(o);
							}
							if (o.userCan.unPublish) {
								canDoSomething = true;
								self.publishSelected.unpublishableFiles.push(o);
							}
							if (canDoSomething) {
								var name = o.displayName || o.documentFileName || o.internalOriginalName;
								self.publishSelected.confirmItems.push(name);
							}
						});

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
							var dirs = _.size(self.checkedDirs);
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
								.then(function (result) {
									//$log.debug('File results ', JSON.stringify(result));
									if (directoryStructure) {
										//$log.debug('Setting the new directory structure...');
										$scope.project.directoryStructure = directoryStructure;
										$scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
									}
									//$log.debug('select and refresh destination directory...');
									self.selectNode(destination.model.id);
									AlertService.success('The selected items were moved.');
								}, function (err) {
									self.busy = false;
									AlertService.error("The selected items could not be moved.");
								});
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
					//console.log('onPermissionsUpdate...');
					self.selectNode(self.currentNode.model.id);
				};

				self.onDocumentUpdate = function(value) {
					// should refresh the table and the info panel...
					//console.log('onDocumentUpdate...');
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
						Promise.all(promises).then(function() {
							AlertService.success('The document' + (documents.length > 1 ? 's were' : ' was') + ' successfully added to the collection' + (collections.length > 1 ? 's.' : '.'));
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

						promises = _.union(_.map(added, function(c) {
							return CollectionModel.addOtherDocument(c._id, documents._id);
						}), _.map(removed, function(c) {
							return CollectionModel.removeOtherDocument(c._id, documents._id);
						}));

						Promise.all(promises).then(function() {
							AlertService.success('The document\'s collections were successfully updated.');
						}, function(err) {
							AlertService.error('The document\'s collections were not successfully updated: '+ err.message);
						});
					}
				};

				$scope.$on('documentMgrRefreshNode', function (event, args) {
					console.log('documentMgrRefreshNode...', args.directoryStructure);
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
	}])
;
