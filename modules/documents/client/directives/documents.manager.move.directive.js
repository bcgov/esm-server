'use strict';
angular.module('documents')
	.directive('documentMgrMove', ['$rootScope', '$modal', '$log', '$timeout', '$animate', '_', 'moment', 'Authentication', 'DocumentMgrService', 'TreeModel', 'ProjectModel', 'Document', function ($rootScope, $modal, $log, $timeout, $animate, _, moment, Authentication, DocumentMgrService, TreeModel, ProjectModel, Document) {
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

							self.view = 'select'; // select or mvoe
							self.busy = false;

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

							self.selectNode = function (nodeId) {
								self.busy = true;
								var theNode = self.rootNode.first(function (n) {
									return n.model.id === nodeId;
								});
								if (!theNode) {
									theNode = self.rootNode;
								}

								self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
								self.folderURL = window.location.protocol + "//" + window.location.host + "/p/" + $scope.project.code + "/docs?folder=" + self.currentNode.model.id;
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

											self.unsortedFiles = _.map(result.data, function (f) {
												// making sure that the displayName is set...
												if (_.isEmpty(f.displayName)) {
													f.displayName = f.documentFileName || f.internalOriginalName;
												}
												if (_.isEmpty(f.dateUploaded) && !_.isEmpty(f.oldData)) {
													var od = JSON.parse(f.oldData);
													//console.log(od);
													try {
														f.dateUploaded = moment(od.WHEN_CREATED, "MM/DD/YYYY HH:mm").toDate();
													} catch (ex) {
														console.log('Error parsing WHEN_CREATED from oldData', JSON.stringify(f.oldData));
													}
												}
												return _.extend(f, {
													selected: (_.find(self.checkedFiles, function (d) {
														return d._id.toString() === f._id.toString();
													}) !== undefined), type: 'File', disabled: true
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
													type: 'Directory'
												});
											});

											self.applySort();
											// since we loaded this, make it the selected node
											self.selectedNode = self.currentNode;
											self.selectedName = self.selectedNode.model.name === 'ROOT' ? $scope.project.name : self.selectedNode.model.name;
											self.title = self.titleText + " to '" + self.selectedName + "'";

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

							self.select = function () {
								self.view = 'move';
							};

							self.back = function () {
								self.view = 'select';
							};

							self.move = function () {
								// call back into the main document manager and get it to do the moving etc...
								$scope.moveSelected.ok(self.selectedNode)
									.then(function (ok) {
											$modalInstance.close(self.selectedNode);
										},
										function (err) {
										});
							};

							// initialize the view
							self.selectNode($scope.node.model.id);

							// need this for add new folder...
							$scope.$watch(function (scope) {
									return scope.project.directoryStructure;
								},
								function (data) {
									var node = self.currentNode || self.rootNode;
									self.rootNode = tree.parse(data);
									self.selectNode(node.model.id);
								}
							);
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
