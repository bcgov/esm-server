'use strict';
angular.module('documents')

	.directive('documentMgr', ['_', 'moment', 'Authentication', 'DocumentMgrService', 'DialogService', 'SelectDirDialog', 'TreeModel', 'ProjectModel', 'Document', function (_, moment, Authentication, DocumentMgrService, DialogService, SelectDirDialog, TreeModel, ProjectModel, Document) {
		return {
			restrict: 'E',
			scope: {
				project: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager.html',
			controller: function ($scope, $log, _, moment, Authentication, DocumentMgrService, TreeModel, ProjectModel, Document) {
				var tree = new TreeModel();
				var self = this;
				self.busy = true;

				$scope.authentication = Authentication;
				$scope.project.directoryStructure = $scope.project.directoryStructure || {
						id: 1,
						lastId: 1,
						name: 'ROOT'
					};

				// default sort is by name ascending...
				self.sorting = {
					column: 'name',
					ascending: true
				};

				self.rootNode = tree.parse($scope.project.directoryStructure);
				self.selectedNode = undefined;
				self.currentNode = undefined;
				self.currentPath = undefined;

				self.allChecked = false;
				self.checkedDirs = [];
				self.checkedFiles = [];
				self.lastChecked = {fileId: undefined, directoryID: undefined};

				self.unsortedFiles = [];
				self.unsortedDirs = [];

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
					},
					setData: function() {
						self.infoPanel.reset();
						// check to see if there is a single lastChecked item set first...
						if (self.lastChecked) {
							if (self.lastChecked.fileId) {
								self.infoPanel.type = 'File';
								var file = _.find(self.currentFiles, function(o) { return o._id.toString() === self.lastChecked.fileId; });
								self.infoPanel.data = file ? file : undefined;
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
					// sort ascending first...
					self.currentFiles = _.sortBy(self.unsortedFiles, function(f) {
						// more making sure that the displayName is set...
						if (_.isEmpty(f.displayName)) {
							f.displayName = f.documentFileName || f.internalOriginalName;
						}

						if (self.sorting.column === 'name') {
							return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
						} else if (self.sorting.column === 'author') {
							return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
						} else if (self.sorting.column === 'type') {
							return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
						} else if (self.sorting.column === 'size') {
							return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
						} else if (self.sorting.column === 'date') {
							//date uploaded
							return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
						} else if (self.sorting.column === 'pub') {
							//is published...
							return !f.isPublished;
						}
						// by name if none specified... or we incorrectly identified...
						return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
					});

					// directories always/only sorted by name
					self.currentDirs = _.sortBy(self.unsortedDirs,function(d) {
						if (_.isEmpty(d.model.name)) {
							return null;
						}
						return d.model.name.toLowerCase();
					});

					if (!self.sorting.ascending) {
						// and if we are not supposed to be ascending... then reverse it!
						self.currentFiles = _(self.currentFiles).reverse().value();
						if (self.sorting.column === 'name') {
							// name is the only sort that applies to Directories.
							// so if descending on name, then we need to reverse it.
							self.currentDirs = _(self.currentDirs).reverse().value();
						}
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

				self.selectNode = function (nodeId) {
					self.busy = true;
					var theNode = self.rootNode.first(function (n) {
						return n.model.id === nodeId;
					});
					if (!theNode) {
						theNode = self.rootNode;
					}

					self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
					self.currentPath = theNode.getPath() || [];
					self.unsortedFiles = [];
					self.unsortedDirs = [];
					self.currentFiles = [];
					self.currentDirs = [];

					//$log.debug('currentNode (' + self.currentNode.model.name + ') get documents...');
					DocumentMgrService.getDirectoryDocuments($scope.project, self.currentNode.model.id)
						.then(
							function (result) {
								//$log.debug('...currentNode (' + self.currentNode.model.name + ') got '+ _.size(result.data ) + '.');

								self.unsortedFiles = _.map(result.data, function(f) {
									// making sure that the displayName is set...
									if (_.isEmpty(f.displayName)) {
										f.displayName = f.documentFileName || f.internalOriginalName;
									}
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

								self.unsortedDirs = _.map(self.currentNode.children, function (n) {
									return _.extend(n,{selected: (_.find(self.checkedDirs, function(d) { return d.model.id === n.model.id; }) !== undefined), type: 'Directory'});
								});

								self.applySort();
								// since we loaded this, make it the selected node
								self.selectedNode = self.currentNode;

								// see what is currently checked
								self.syncCheckedItems();
								self.busy = false;
							},
							function (error) {
								$log.error('getDirectoryDocuments error: ', JSON.stringify(error));
								self.busy = false;
							}
						);
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

				self.deleteDir = function(doc) {
					self.busy = true;
					return DocumentMgrService.removeDirectory($scope.project, doc)
						.then(function(result) {
							$scope.project.directoryStructure = result.data;
							self.busy = false;
							DialogService.show('success', 'Delete Folder', 'The selected folder was deleted.', [doc.model.name]);
						}, function(error) {
							$log.error('DocumentMgrService.removeDirectory error: ', JSON.stringify(error));
							self.busy = false;
							DialogService.error('Delete Folder', "Selected folder could not be deleted.", error);
						});
				};

				self.deleteFile = function(doc) {
					self.busy = true;
					return self.deleteDocument(doc._id)
						.then(function(result) {
							self.selectNode(self.currentNode.model.id); // will mark as not busy...
							var name = doc.displayName || doc.documentFileName || doc.internalOriginalName;
							DialogService.show('success', 'Delete File', 'The selected file was deleted.', [name]);
						}, function(error) {
							$log.error('deleteFile error: ', JSON.stringify(error));
							self.busy = false;
							DialogService.error('Delete File', "Selected file could not be deleted.", error);
						});
				};

				self.deleteSelected = {
					titleText: 'Delete File(s)',
					okText: 'Yes',
					cancelText: 'No',
					ok: function() {
						var dirs = _.size(self.checkedDirs);
						var files = _.size(self.checkedFiles);
						if (dirs === 0 && files === 0) {
							return Promise.resolve();
						} else {
							self.busy = true;

							var dirPromises = _.map(self.deleteSelected.deleteableFolders, function(d) {
								return DocumentMgrService.removeDirectory($scope.project, d);
							});

							var filePromises = _.map(self.deleteSelected.deleteableFiles, function(f) {
								return self.deleteDocument(f._id);
							});

							var directoryStructure;
							return Promise.all(dirPromises)
								.then(function(result) {
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
									}
									//$log.debug('Refreshing current directory...');
									self.selectNode(self.currentNode.model.id);
									DialogService.show('success', self.deleteSelected.titleText, 'The selected items were deleted.', self.deleteSelected.confirmItems);
								}, function(err) {
									self.busy = false;
									DialogService.error('Delete failure', "An error occurred.  The selected items could not be deleted.", err);
								});
						}
					},
					cancel: undefined,
					confirmText:  'Are you sure you want to delete the selected item(s)?',
					confirmItems: [],
					deleteableFolders: [],
					deleteableFiles: [],
					setContext: function() {
						self.deleteSelected.confirmItems = [];
						self.deleteSelected.titleText = 'Delete selected';
						self.deleteSelected.confirmText = 'Are you sure you want to delete the following the selected item(s)?';
						var dirs = _.size(self.checkedDirs);
						var files = _.size(self.checkedFiles);
						if (dirs > 0 && files > 0) {
							self.deleteSelected.titleText = 'Delete Folder(s) and File(s)';
							self.deleteSelected.confirmText = 'Are you sure you want to delete the following ('+ dirs +') folders and ('+ files +') files?';
						} else if (dirs > 0) {
							self.deleteSelected.titleText = 'Delete Folder(s)';
							self.deleteSelected.confirmText = 'Are you sure you want to delete the following ('+ dirs +') selected folders?';
						} else if (files > 0) {
							self.deleteSelected.titleText = 'Delete File(s)';
							self.deleteSelected.confirmText = 'Are you sure you want to delete the following ('+ files +') selected files?';
						}

						self.deleteSelected.confirmItems = [];
						self.deleteSelected.deleteableFolders = [];
						self.deleteSelected.deleteableFiles = [];

						_.each(self.checkedDirs, function(o) {
							if ($scope.project.userCan.manageFolders) {
								self.deleteSelected.confirmItems.push(o.model.name);
								self.deleteSelected.deleteableFolders.push(o);
							}
						});
						_.each(self.checkedFiles, function(o) {
							if (o.userCan.delete) {
								var name = o.displayName || o.documentFileName || o.internalOriginalName;
								self.deleteSelected.confirmItems.push(name);
								self.deleteSelected.deleteableFiles.push(o);
							}
						});

					}
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
							DialogService.show('success', 'Publish File(s)', _.size(published) + ' of ' + _.size(files) + ' files successfully published.', published);
						}, function(err) {
							self.busy = false;
							DialogService.error('Publish File(s)', "Selected files could not be published.", err);
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
							DialogService.show('success', 'Unpublish File(s)', _.size(unpublished) + ' of ' + _.size(files) + ' files successfully unpublished.', unpublished);
						}, function(err) {
							self.busy = false;
							DialogService.error('Unpublish File(s)', "Selected files could not be unpublished.", err);
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
					ok: function() {
						// confirmed, so do the work
						return SelectDirDialog.select('Move Files', $scope.project, self.rootNode, self.rootNode, self.checkedDirs, self.checkedFiles).then(function(destination) {
							if (!destination) {
								console.log(' : ( ');
							} else {

								var dirs = _.size(self.checkedDirs);
								var files = _.size(self.checkedFiles);
								if (dirs === 0 && files === 0) {
									return Promise.resolve();
								} else {
									self.busy = true;

									var dirPromises = _.map(self.moveSelected.moveableFolders, function(d) {
										return DocumentMgrService.moveDirectory($scope.project, d, destination);
									});

									var filePromises = _.map(self.moveSelected.moveableFiles, function(f) {
										f.directoryID = destination.model.id;
										return Document.save(f);
									});

									var directoryStructure;
									return Promise.all(dirPromises)
										.then(function(result) {
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
											}
											//$log.debug('select and refresh destination directory...');
											self.selectNode(destination.model.id);
											DialogService.show('success', self.moveSelected.titleText, 'The selected items were moved.', self.moveSelected.confirmItems);
										}, function(err) {
											self.busy = false;
											DialogService.error('Move failure', "An error occurred.  The selected items could not be moved.", err);
										});
								}
							}

						}, function(err) {
							console.log('err ', err);
						});
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

				$scope.$on('documentMgrRefreshNode', function(event, args) {
					self.selectNode(self.currentNode.model.id);
				});

				// set it up at the root...
				$scope.$watch(function (scope) {
						return scope.project.directoryStructure;
					},
					function (data) {
						var node = self.currentNode || self.rootNode;
						self.rootNode = tree.parse(data);
						self.selectNode(node.model.id);
					}
				);

			},
			controllerAs: 'documentMgr'
		};
	}])
	.directive('documentMgrAddFolder', ['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', 'DialogService', 'TreeModel', function ($rootScope, $modal, $log, _, DocumentMgrService, DialogService, TreeModel) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				node: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/documents/client/views/document-manager-add.html',
						resolve: {},
						controllerAs: 'addFolder',
						controller: function ($scope, $modalInstance) {
							var self = this;

							$scope.project = scope.project;
							$scope.node = scope.node;

							self.entryText = '';
							self.title = "Add Folder to '" + $scope.node.model.name + "'";
							if ($scope.node.model.name === 'ROOT') {
								self.title = "Add Folder to '" + $scope.project.name + "'";
							}

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.ok = function () {
								DocumentMgrService.addDirectory($scope.project, $scope.node, self.entryText)
									.then(
										function (result) {
											$modalInstance.close(result.data);
										},
										function (err) {
											//$log.error('addDirectory error: ', JSON.stringify(err));
											DialogService.error('Add Folder Error', "Could not add folder", err);
										}
									);
							};

						}
					}).result.then(function (data) {
						scope.project.directoryStructure = data;
						$rootScope.$broadcast('DOCUMENT_MGR_FOLDER_ADDED', {directoryStructure: data});
					})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};
	}])
	.directive('documentMgrRenameFolder', ['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', 'DialogService', 'TreeModel', function ($rootScope, $modal, $log, _, DocumentMgrService, DialogService, TreeModel) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				root: '=',
				node: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						size: 'lg',
						templateUrl: 'modules/documents/client/views/document-manager-add.html',
						resolve: {},
						controllerAs: 'addFolder',
						controller: function ($scope, $modalInstance) {
							var self = this;

							$scope.project = scope.project;
							$scope.node = scope.node || scope.root;

							self.entryText = '';
							self.title = "Rename Folder '" + $scope.node.model.name + "'";
							if ($scope.node.model.name === 'ROOT') {
								$modalInstance.dismiss('cancel');
							}

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.ok = function () {
								DocumentMgrService.renameDirectory($scope.project, $scope.node, self.entryText)
									.then(
										function (result) {
											$modalInstance.close(result.data);
										},
										function (err) {
											//$log.error('renameDirectory error: ', JSON.stringify(err));
											DialogService.error('Rename Folder Error', "Could not rename folder", err);
										}
									);
							};

						}
					}).result.then(function (data) {
						scope.project.directoryStructure = data;
						$rootScope.$broadcast('DOCUMENT_MGR_FOLDER_RENAMED', {directoryStructure: data});
					})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};
	}])
	.directive('documentMgrUploadModal',['$rootScope', '$modal', '$log', '$timeout', '_', 'DocumentsUploadService', 'DocumentMgrService', function ($rootScope, $modal, $log, $timeout, _, DocumentsUploadService, DocumentMgrService){
		return {
			restrict: 'A',
			scope: {
				project: '=',
				root: '=',
				node: '=',
				type: '=',
				parentId: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						size: 'lg',
						templateUrl: 'modules/documents/client/views/document-manager-upload-modal.html',
						resolve: {},
						controllerAs: 'uploadModal',
						controller: function ($rootScope, $scope, $modalInstance) {
							var self = this;

							$scope.uploadService = DocumentsUploadService;
							$scope.uploadService.reset(); // just in case... want the upload service to be cleared

							$scope.project = scope.project;
							$scope.node = scope.node || scope.root;

							self.rootNode = scope.root;
							self.selectedNode = scope.node;
							self.type = scope.type;
							self.parentId = scope.parentId;

							self.title = "Upload Files to '" + self.selectedNode.model.name + "'";
							if (self.selectedNode.model.name === 'ROOT') {
								self.title = "Upload Files to '" + $scope.project.name + "'";
							}

							var getTargetUrl = function(type) {
								var t = type || 'project';
								// determine URL for upload, default to project if none set.
								if (t === 'comment' && self.parentId) {
									return '/api/commentdocument/publiccomment/' + self.parentId + '/upload';
								}
								if (t === 'project' && $scope.project) {
									return '/api/document/' + $scope.project._id + '/upload';
								}
							};

							self.cancel = function () {
								$scope.uploadService.reset();
								$modalInstance.dismiss('cancel');
							};

							self.startUploads = function () {
								DocumentsUploadService.startUploads(getTargetUrl(self.type), self.selectedNode.model.id, false, new Date());
							};

							$scope.$watch(function ($scope) {
									return $scope.uploadService.actions.completed;
								},
								function (completed) {
									if (completed) {
										$rootScope.$broadcast('documentMgrRefreshNode', {nodeId: self.selectedNode.model.id});
									}
								}
							);

						}
					}).result.then(function (data) {
							//$log.debug(data);
						})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};

	}])
	.directive('documentMgrUpload', ['$rootScope', '$timeout', '$log', 'Upload', '_', 'DocumentsUploadService', 'DocumentMgrService', 'Document', function ($rootScope, $timeout, $log, Upload, _, DocumentsUploadService) {
		return {
			restrict: 'E',
			scope: {
				project: '=',
				root: '=',
				node: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager-upload.html',
			controller: function ($rootScope, $scope, $timeout, $log, Upload, _) {
				var self = this;

				$scope.uploadService = DocumentsUploadService;

				$scope.project = $scope.project;
				$scope.node = $scope.node || $scope.root;

				self.rootNode = $scope.root;
				self.selectedNode = $scope.node;

				$scope.$watch('files', function (newValue) {
					if (newValue) {
						_.each(newValue, function(file, idx) {
							$scope.uploadService.addFile(file);
						});
					}
				});

			},
			controllerAs: 'documentMgrUpload'
		};
	}])
	.directive('documentMgrLink', ['_', 'moment', 'Authentication', 'DocumentMgrService', 'DialogService', 'TreeModel', 'ProjectModel', 'Document', function (_, moment, Authentication, DocumentMgrService, DialogService, TreeModel, ProjectModel, Document) {
		return {
			restrict: 'E',
			scope: {
				project: '=',
				linkedFiles: '=',
				publishedOnly: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager-link.html',
			controller: function ($scope, $log, _, moment, Authentication, DocumentMgrService, TreeModel, ProjectModel, Document) {
				var tree = new TreeModel();
				var self = this;
				self.busy = true;

				$scope.authentication = Authentication;
				$scope.project.directoryStructure = $scope.project.directoryStructure || {
						id: 1,
						lastId: 1,
						name: 'ROOT'
					};

				// default sort is by name ascending...
				self.sorting = {
					column: 'name',
					ascending: true
				};

				self.rootNode = tree.parse($scope.project.directoryStructure);
				self.selectedNode = undefined;
				self.currentNode = undefined;
				self.currentPath = undefined;

				self.allChecked = false;
				self.checkedDirs = [];
				self.checkedFiles = [];
				self.lastChecked = {fileId: undefined, directoryID: undefined};

				self.unsortedFiles = [];
				self.unsortedDirs = [];

				self.currentFiles = [];
				self.currentDirs = [];

				if (!$scope.linkedFiles) {
					$scope.linkedFiles = [];
				}

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
					// sort ascending first...
					self.currentFiles = _.sortBy(self.unsortedFiles, function(f) {
						// more making sure that the displayName is set...
						if (_.isEmpty(f.displayName)) {
							f.displayName = f.documentFileName || f.internalOriginalName;
						}

						if (self.sorting.column === 'name') {
							return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
						} else if (self.sorting.column === 'author') {
							return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
						} else if (self.sorting.column === 'type') {
							return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
						} else if (self.sorting.column === 'size') {
							return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
						} else if (self.sorting.column === 'date') {
							//date uploaded
							return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
						} else if (self.sorting.column === 'pub') {
							//is published...
							return !f.isPublished;
						}
						// by name if none specified... or we incorrectly identified...
						return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
					});

					// directories always/only sorted by name
					self.currentDirs = _.sortBy(self.unsortedDirs,function(d) {
						if (_.isEmpty(d.model.name)) {
							return null;
						}
						return d.model.name.toLowerCase();
					});

					if (!self.sorting.ascending) {
						// and if we are not supposed to be ascending... then reverse it!
						self.currentFiles = _(self.currentFiles).reverse().value();
						if (self.sorting.column === 'name') {
							// name is the only sort that applies to Directories.
							// so if descending on name, then we need to reverse it.
							self.currentDirs = _(self.currentDirs).reverse().value();
						}
					}
				};

				self.linkAll = function() {
					_.each(self.currentFiles, function(o) {
						o.selected = self.allChecked;
						self.linkFile(o);
					});
				};
				self.unlinkFile = function(doc) {
					_.remove($scope.linkedFiles, function(o) { return o._id.toString() === doc._id.toString(); } );
				};
				self.linkFile = function(doc) {
					// ADD/remove to the selected file list...
					if (doc.selected) {
						var f = _.find($scope.linkedFiles, function(o) { return o._id.toString() === doc._id.toString(); });
						if (!f) {
							$scope.linkedFiles.push(doc);
						}
					} else {
						self.unlinkFile(doc);
					}
				};
				self.selectFile = function(doc) {
				};
				self.checkDir = function(doc) {
				};
				self.selectDir = function(doc) {
				};
				self.openDir = function(doc) {
					//double clicked a dir, open it up!
					self.selectNode(doc.model.id);
				};

				self.selectNode = function (nodeId) {
					self.busy = true;
					var theNode = self.rootNode.first(function (n) {
						return n.model.id === nodeId;
					});
					if (!theNode) {
						theNode = self.rootNode;
					}

					self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
					self.currentPath = theNode.getPath() || [];
					self.unsortedFiles = [];
					self.unsortedDirs = [];
					self.currentFiles = [];
					self.currentDirs = [];

					//$log.debug('currentNode (' + self.currentNode.model.name + ') get documents...');
					DocumentMgrService.getDirectoryDocuments($scope.project, self.currentNode.model.id)
						.then(
							function (result) {
								//$log.debug('...currentNode (' + self.currentNode.model.name + ') got '+ _.size(result.data ) + '.');

								self.unsortedFiles = _.map(result.data, function(f) {

									// making sure that the displayName is set...
									if (_.isEmpty(f.displayName)) {
										f.displayName = f.documentFileName || f.internalOriginalName;
									}
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

								if ($scope.publishedOnly === 'true') {
									self.unsortedFiles = _.filter(self.unsortedFiles, function(o) { return o.isPublished; });
								}

								self.unsortedDirs = _.map(self.currentNode.children, function (n) {
									return _.extend(n,{selected: (_.find(self.checkedDirs, function(d) { return d.model.id === n.model.id; }) !== undefined), type: 'Directory'});
								});

								self.applySort();
								// since we loaded this, make it the selected node
								self.selectedNode = self.currentNode;
								self.busy = false;
							},
							function (error) {
								$log.error('getDirectoryDocuments error: ', JSON.stringify(error));
								self.busy = false;
							}
						);
				};

				self.selectNode(self.rootNode.model.id);

			},
			controllerAs: 'documentMgr'
		};
	}])
	.directive('documentMgrLinkModal',['$rootScope', '$modal', '$log', '$timeout', '_', 'moment', 'Authentication', 'DocumentMgrService', 'TreeModel', 'ProjectModel', 'Document', function ($rootScope, $modal, $log, $timeout, _, moment, Authentication, DocumentMgrService, TreeModel, ProjectModel, Document){
		return {
			restrict: 'A',
			scope: {
				project: '=',
				target: '=',
				targetName: '=',
				publishedOnly: '=',
				onOk: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						size: 'lg',
						windowClass: 'fb-browser-modal',
						templateUrl: 'modules/documents/client/views/document-manager-link-modal.html',
						resolve: {},
						controllerAs: 'linkModal',
						controller: function ($rootScope, $scope, $modalInstance) {
							var self = this;

							$scope.project = scope.project;
							$scope.authentication = Authentication;

							self.title = "Link Documents to '" + $scope.project.name + "'";
							if (!_.isEmpty(scope.targetName)) {
								self.title = "Link Documents to '" + scope.targetName + "'";
							}

							self.linkedFiles = angular.copy(scope.target || []);
							self.publishedOnly = scope.publishedOnly;

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.ok = function () {
								// return the data in the selected list...
								$modalInstance.close(self.linkedFiles);
							};

						}
					}).result.then(function (data) {
							$log.debug(data);
							// ok, pass data back to the caller....
							if (scope.target) {
								// if they set the target collection... update it.
								scope.target = data;
							}
							if (scope.onOk) {
								//if they set an OK handler, call it.
								scope.onOk(data);
							}
						})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};

	}])
	.service('SelectDirDialog', ['$rootScope', '$timeout', '$log', '$modal', '_', 'Authentication', 'TreeModel', 'moment', 'DocumentMgrService', function ($rootScope, $timeout, $log, $modal, _, Authentication, TreeModel, moment, DocumentMgrService) {

		var service = this;

		service.select = function(title, project, root, node, selectedDirs, selectedFiles) {

			return new Promise(function(fulfill, reject) {
				var _title = title;
				var _project = project;
				var _root = root;
				var _node = node;
				var _selectedDirs = selectedDirs;
				var _selectedFiles = selectedFiles;

				$modal.open({
					animation: true,
					size: 'lg',
					windowClass: 'fb-browser-modal',
					templateUrl: 'modules/documents/client/views/document-manager-select-dir-modal.html',
					resolve: {},
					controllerAs: 'selectDirDlg',
					controller: function ($rootScope, $scope, $modalInstance) {
						var self = this;
						var tree = new TreeModel();

						self.busy = false;
						$scope.project = _project;
						$scope.node = _node || _root;
						$scope.authentication = Authentication;


						self.titleText = _title || 'Select Folder';
						self.title = self.titleText;

						// default sort is by name ascending...
						self.sorting = {
							column: 'name',
							ascending: true
						};

						self.rootNode = tree.parse($scope.project.directoryStructure);
						self.selectedNode = undefined;
						self.currentNode = undefined;
						self.currentPath = undefined;
						self.selectedName = undefined;

						self.allChecked = false;
						self.checkedDirs = [];
						self.checkedFiles = [];
						self.lastChecked = {fileId: undefined, directoryID: undefined};

						self.unsortedFiles = [];
						self.unsortedDirs = [];

						self.currentFiles = [];
						self.currentDirs = [];

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
							// sort ascending first...
							self.currentFiles = _.sortBy(self.unsortedFiles, function(f) {
								// more making sure that the displayName is set...
								if (_.isEmpty(f.displayName)) {
									f.displayName = f.documentFileName || f.internalOriginalName;
								}

								if (self.sorting.column === 'name') {
									return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
								} else if (self.sorting.column === 'author') {
									return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
								} else if (self.sorting.column === 'type') {
									return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
								} else if (self.sorting.column === 'size') {
									return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
								} else if (self.sorting.column === 'date') {
									//date uploaded
									return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
								} else if (self.sorting.column === 'pub') {
									//is published...
									return !f.isPublished;
								}
								// by name if none specified... or we incorrectly identified...
								return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
							});

							// directories always/only sorted by name
							self.currentDirs = _.sortBy(self.unsortedDirs,function(d) {
								if (_.isEmpty(d.model.name)) {
									return null;
								}
								return d.model.name.toLowerCase();
							});

							if (!self.sorting.ascending) {
								// and if we are not supposed to be ascending... then reverse it!
								self.currentFiles = _(self.currentFiles).reverse().value();
								if (self.sorting.column === 'name') {
									// name is the only sort that applies to Directories.
									// so if descending on name, then we need to reverse it.
									self.currentDirs = _(self.currentDirs).reverse().value();
								}
							}
						};

						self.checkAll = function() {
						};
						self.checkFile = function(doc) {
						};
						self.selectFile = function(doc) {
						};

						self.checkDir = function(doc) {
						};
						self.selectDir = function(doc) {
							// selected a dir, make it the only item selected...
							var checked = doc.selected;
							_.each(self.currentDirs, function(o) { o.selected = false; });
							_.each(self.currentFiles, function(o) { o.selected = false; });
							doc.selected = !checked;
						};
						self.openDir = function(doc) {
							// double clicked a dir, open it up!
							// if it's not selected...
							var dir = _.find(_selectedDirs, function(o) { return o.model.id === doc.model.id; });
							if (!dir) {
								self.selectNode(doc.model.id);
							}
						};

						self.selectNode = function (nodeId) {
							self.busy = true;
							var theNode = self.rootNode.first(function (n) {
								return n.model.id === nodeId;
							});
							if (!theNode) {
								theNode = self.rootNode;
							}

							self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
							self.currentPath = theNode.getPath() || [];
							self.unsortedFiles = [];
							self.unsortedDirs = [];
							self.currentFiles = [];
							self.currentDirs = [];

							//$log.debug('currentNode (' + self.currentNode.model.name + ') get documents...');
							DocumentMgrService.getDirectoryDocuments($scope.project, self.currentNode.model.id)
								.then(
									function (result) {
										//$log.debug('...currentNode (' + self.currentNode.model.name + ') got '+ _.size(result.data ) + '.');

										self.unsortedFiles = _.map(result.data, function(f) {
											// making sure that the displayName is set...
											if (_.isEmpty(f.displayName)) {
												f.displayName = f.documentFileName || f.internalOriginalName;
											}
											if (_.isEmpty(f.dateUploaded) && !_.isEmpty(f.oldData)) {
												var od = JSON.parse(f.oldData);
												//console.log(od);
												try {
													f.dateUploaded = moment(od.WHEN_CREATED, "MM/DD/YYYY HH:mm").toDate();
												} catch(ex) {
													console.log('Error parsing WHEN_CREATED from oldData', JSON.stringify(f.oldData));
												}
											}
											return _.extend(f,{selected:  (_.find(self.checkedFiles, function(d) { return d._id.toString() === f._id.toString(); }) !== undefined), type: 'File', disabled: true});
										});

										self.unsortedDirs = _.map(self.currentNode.children, function (n) {
											return _.extend(n,{selected: (_.find(self.checkedDirs, function(d) { return d.model.id === n.model.id; }) !== undefined), type: 'Directory'});
										});
										// if we have passed in selectedDirs, we want those excluded from the listing...
										_.remove(self.unsortedDirs, function(n) { return _.find(_selectedDirs, function(d) { return d.model.id === n.model.id; }) !== undefined; });

										self.applySort();
										// since we loaded this, make it the selected node
										self.selectedNode = self.currentNode;
										self.title = self.titleText + " to '" + self.selectedNode.model.name + "'";
										if (self.selectedNode.model.name === 'ROOT') {
											self.title = self.titleText + " to '" + $scope.project.name + "'";
										}

										self.busy = false;
									},
									function (error) {
										$log.error('getDirectoryDocuments error: ', JSON.stringify(error));
										self.busy = false;
									}
								);
						};


						self.cancel = function () {
							$modalInstance.dismiss('cancel');
						};

						self.ok = function () {
							// return the data in the selected list...
							$modalInstance.close(self.selectedNode);
						};

						self.selectNode($scope.node.model.id);
					}
				}).result
					.then(function (data) {
						$log.debug(data);
						fulfill(data);
					})
					.catch(function (err) {
						$log.error(err);
						reject(err);
					});
			});

		};

	}])

;
