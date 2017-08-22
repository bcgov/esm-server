'use strict';
angular.module('documents')
	.directive('documentMgrMove', ['$rootScope', '$modal', '$log', '$timeout', '$animate', '_', 'moment', 'Authentication', 'DocumentMgrService', 'TreeModel', 'ProjectModel', 'Document', 'FolderModel', function ($rootScope, $modal, $log, $timeout, $animate, _, moment, Authentication, DocumentMgrService, TreeModel, ProjectModel, Document, FolderModel) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				root: '=',
				node: '=',
				moveSelected: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						size: 'lg',
						windowClass: 'fb-browser-modal',
						templateUrl: 'modules/documents/client/views/document-manager-move.html',
						resolve: {},
						controllerAs: 'moveDlg',
						controller: function ($rootScope, $scope, $modalInstance) {
							var self = this;
							var tree = new TreeModel();

							self.view = 'select'; // select or move
							self.busy = false;
							self.showWarning = false; // whether to show a warning when published content is moved to UNpublished folders
							self.canMoveContent = true; // whether content can be moved to a destination folder. True by default.

							$scope.project = scope.project;
							$scope.node = scope.node || scope.root;
							$scope.authentication = Authentication;

							$scope.moveSelected = scope.moveSelected;


							self.titleText = scope.titleText || 'Move files and folders';
							self.title = self.titleText;

							// default sort is by name ascending...
							self.sorting = {
								column: 'name',
								ascending: true
							};

							self.rootNode = tree.parse($scope.node.model);
							self.selectedNode = undefined;
							self.currentNode = undefined;
							self.currentPath = undefined;
							self.selectedName = undefined;

							self.allChecked = false;
							self.checkedDirs = [];
							self.checkedFiles = [];
							self.lastChecked = { fileId: undefined, directoryID: undefined };

							self.unsortedFiles = [];
							self.unsortedDirs = [];

							self.currentFiles = [];
							self.currentDirs = [];

							// constants
							var MIXED_CONTENT = 'mixed';
							var ONLY_UNPUBLISHED_CONTENT = 'only-unpublished';
							var ONLY_PUBLISHED_CONTENT = 'only-published';

							determineContentType();

							self.selectPromptText = "Select a destination folder";
							if (self.contentType === MIXED_CONTENT) {
								self.selectPromptText += " suitable for some published content";
							} else if (self.contentType === ONLY_PUBLISHED_CONTENT) {
								self.selectPromptText += " suitable for published content";
							}


							self.sortBy = function (column) {
								//is this the current column?
								if (self.sorting.column.toLowerCase() === column.toLowerCase()) {
									//so we reverse the order...
									self.sorting.ascending = !self.sorting.ascending;
								} else {
									// changing column, set to ascending...
									self.sorting.column = column.toLowerCase();
									self.sorting.ascending = true;
								}
								self.applySort();
							};

							function determineContentType() {
								var dp = _.find($scope.moveSelected.moveableFiles, function (doc) {
									return doc.isPublished;
								});
								var fp = _.find($scope.moveSelected.moveableFolders, function (fld) {
									return fld.model.folderObj.isPublished;
								});
								var du = _.find($scope.moveSelected.moveableFiles, function (doc) {
									return !doc.isPublished;
								});
								var fu = _.find($scope.moveSelected.moveableFolders, function (fld) {
									return !fld.model.folderObj.isPublished;
								});
								var movingPublishedContent = !!(dp || fp);
								var movingUnPublishedContent = !!(du || fu);

								self.contentType = ONLY_UNPUBLISHED_CONTENT;
								self.selectPromptText = "Select a destination folder";
								if (movingPublishedContent) {
									if (movingUnPublishedContent) {
										self.selectPromptText += " suitable for some published content";
										self.contentType = MIXED_CONTENT;
									} else {
										self.selectPromptText += " suitable for published content";
										self.contentType = ONLY_PUBLISHED_CONTENT;
									}
								}
							}
							self.applySort = function () {
								// sort ascending first...
								self.currentFiles = _(self.unsortedFiles).chain().sortBy(function (f) {
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
								}).sortBy(function (f) {
									return f.order;
								}).value();

								// directories always/only sorted by name
								self.currentDirs = _(self.unsortedDirs).chain().sortBy(function (d) {
									if (_.isEmpty(d.model.name)) {
										return null;
									}
									return d.model.name.toLowerCase();
								}).sortBy(function (d) {
									return d.model.order;
								}).value();

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

							self.selectDir = function (doc) {
								// selected a dir, make it the only item selected...
								var checked = doc.selected;
								_.each(self.currentDirs, function (o) {
									o.selected = false;
								});
								_.each(self.currentFiles, function (o) {
									o.selected = false;
								});
								doc.selected = !checked;
							};

							self.openDir = function (doc) {
								// double clicked a dir, open it up!
								// if it's not selected...
								var sourceDir = _.find($scope.moveSelected.moveableFolders, function (o) {
									return o.model.id === doc.model.id;
								});
								if (!sourceDir) {
									self.selectNode(doc.model.id);
								}
							};

							self.selectNode = function (nodeId, nodeFolderObj) {
								self.busy = true;
								var theNode = self.rootNode.first(function (n) {
									return n.model.id === nodeId;
								});
								if (nodeFolderObj) { //we are making sure a node folderObj is defined. The reason adding folderObj at this point is because the Node(current folder) does not have the folderObj
									theNode.model.folderObj = nodeFolderObj;
								}
								if (!theNode) {
									theNode = self.rootNode;
								}

								self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
								self.folderURL = window.location.protocol + "//" + window.location.host + "/p/" + $scope.project.code + "/docs?folder=" + self.currentNode.model.id;

								self.unsortedFiles = [];
								self.unsortedDirs = [];
								self.currentFiles = [];
								self.currentDirs = [];

								var pathArray = theNode.getPath();
								self.currentPath = pathArray || [];

								// retrieve folder details from back-end API as a set of promises
								var folderPromises = _.map(pathArray, function(elem) {
									// bail the root node cuz we don't need to attatch the folderObj to it
									if (elem.model.id === 1) {
										return Promise.resolve();
									}

									// trying to reduce the amount of API calls only by checking if node model does not have folderObj
									if (elem.model.hasOwnProperty('folderObj')) {
										return Promise.resolve();
									}

									// attach folder details object to the client-side models
									return FolderModel.lookup($scope.project._id, elem.model.id)
									.then(function (folder) {
										elem.model.folderObj = folder;
									});
								});

								return Promise.all(folderPromises)
								.then(function () {
									// flag whether the target (destination) folder is published or not...
									// this will drive logic to exclude some items from the move operation
									self.targetDirectoryIsPublished = self.currentNode.model.name === 'ROOT' ? true : self.currentNode.model.folderObj.isPublished;
								})
								.then(function () {
									// Go through each of the currently available folders in view, and attach the object
									// to the model dynamically so that the permissions directive will work by using the
									// correct x-object=folderObject instead of a doc.
									return FolderModel.lookupForProjectIn($scope.project._id, self.currentNode.model.id)
										.then(function (folders) {
											_.each(folders, function (fs) {
												// We do breadth-first because we like to talk to our neighbours before moving
												// onto the next level (where we bail for performance reasons).
												theNode.walk({ strategy: 'breadth' }, function (n) {
													if (n.model.id === fs.directoryID) {
														n.model.folderObj = fs;
														return false;
													}
												});
											});
										});
								})
								.then(function () {
									return DocumentMgrService.getDirectoryDocuments($scope.project, self.currentNode.model.id);
								})
								.then(function (result) {
									self.unsortedFiles = _.map(result.data, function (f) {
										// making sure that the displayName is set...
										if (_.isEmpty(f.displayName)) {
											f.displayName = f.documentFileName || f.internalOriginalName;
										}
										if (_.isEmpty(f.dateUploaded) && !_.isEmpty(f.oldData)) {
											var od = JSON.parse(f.oldData);
											try {
												f.dateUploaded = moment(od.WHEN_CREATED, "MM/DD/YYYY HH:mm").toDate();
											} catch (ex) {
												console.log('Error parsing WHEN_CREATED from oldData', JSON.stringify(f.oldData));
											}
										}
										return _.extend(f, {
											selected: (_.find(self.checkedFiles, function (d) {
												return d._id.toString() === f._id.toString();
											}) !== undefined),
											type: 'File',
											disabled: true,
											moveDisabled: f.isPublished && !self.targetDirectoryIsPublished
										});
									});

									self.unsortedDirs = _.map(self.currentNode.children, function (n) {
										var isSourceDir, isCheckedDir = false;
										var sourceDir = _.find($scope.moveSelected.moveableFolders, function (d) {
											return d.model.id === n.model.id;
										});
										if (sourceDir) {
											isSourceDir = true;
										}
										var checkedDir = _.find(self.checkedDirs, function (d) {
											return d.model.id === n.model.id;
										});
										if (checkedDir) {
											isCheckedDir = true;
										}

										return _.extend(n, {
											selected: isCheckedDir,
											sourceDir: isSourceDir,
											type: 'Folder',
											disabled: false,
											moveDisabled: n.model.folderObj.isPublished && !self.targetDirectoryIsPublished
										});
									});

									self.applySort();
									// since we loaded this, make it the selected node
									self.selectedNode = self.currentNode;
									self.selectedName = self.selectedNode.model.name === 'ROOT' ? $scope.project.name : self.selectedNode.model.folderObj.displayName;
									self.title = self.titleText + " to '" + self.selectedName + "'";

									self.busy = false;
								})
								.then(function () {
									// flag content that shouldn't be moved (as per EPIC-1155)
									// we want to block the move of published content into UNpublished folders
									$scope.moveSelected.moveableFolders = _.map($scope.moveSelected.moveableFolders, function (fld) {
										return _.extend(fld, {
											moveDisabled: fld.model.folderObj.isPublished && !self.targetDirectoryIsPublished
										});
									});

									$scope.moveSelected.moveableFiles = _.map($scope.moveSelected.moveableFiles, function (doc) {
										return _.extend(doc, {
											moveDisabled: doc.isPublished && !self.targetDirectoryIsPublished
										});
									});

									// show a warning when trying to move published content into UNpublished folders
									var allContent = ($scope.moveSelected.moveableFolders || []).concat($scope.moveSelected.moveableFiles);
									self.showWarning = _.some(allContent, 'moveDisabled', true);

									// flag whether there's anything allowed to be moved (or not)
									self.canMoveContent = self.targetDirectoryIsPublished || self.contentType !== ONLY_PUBLISHED_CONTENT;
								})
								.then(function () {
									// trigger an UI update with all data changes pulled from the back-end
									$scope.$apply();
								})
								.catch(function (error) {
									$log.error('getDirectoryDocuments error: ', JSON.stringify(error));
									self.busy = false;
								});
							};

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.select = function () {
								self.view = 'move';
							};

							self.back = function () {
								self.view = 'select';
							};

							self.move = function () {
								// filter out content that shouldn't be moved...
								$scope.moveSelected.moveableFolders = _.filter($scope.moveSelected.moveableFolders, 'moveDisabled', false);
								$scope.moveSelected.moveableFiles = _.filter($scope.moveSelected.moveableFiles, 'moveDisabled', false);

								// call back into the main document manager and get it to do the moving etc...
								$scope.moveSelected.ok(self.selectedNode)
									.then(function (ok) {
										$modalInstance.close(self.selectedNode);
									})
									.catch(function (err) {
										// we want to dismiss the move dialog when an error is thrown by the server-side API
										$modalInstance.close(self.selectedNode);
									});
							};

							// initialize the view
							self.selectNode($scope.node.model.id);

							// need this for add new folder...
							$scope.$on('documentMgrRefreshNode', function (event, args) {
								self.rootNode = tree.parse(args.directoryStructure);
								self.selectNode(self.currentNode.model.id, self.currentNode.model.folderObj);
							});
						}
					}).result
						.then(function (data) {
							//$log.debug(data);
						})
						.catch(function (err) {
							//$log.error(err);
						});
				});
			}
		};
	}])
	;
