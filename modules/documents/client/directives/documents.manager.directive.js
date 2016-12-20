'use strict';
angular.module('documents')

	.directive('documentMgr', ['_', 'DocumentMgrService', 'TreeModel', 'ProjectModel', 'Document', function (_, DocumentMgrService, TreeModel, ProjectModel, Document) {
		return {
			restrict: 'E',
			scope: {
				project: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager.html',
			controller: function ($scope, $log, _, DocumentMgrService, TreeModel, ProjectModel, Document) {
				var tree = new TreeModel();
				var self = this;

				// DETAILS PANEL
				var fbDetailsPanel = angular.element(document.querySelector('#fbBody'));

				$scope.project.directoryStructure = $scope.project.directoryStructure || {
						id: 1,
						lastId: 1,
						name: 'ROOT'
					};

				// NEED TO BE REVIEWED BY JAS
				// Initial pass at getting the detail toggle functionality hooked up
				$scope.fbToggleDetails = function () {
					fbDetailsPanel.toggleClass('panel-open');
				};

				$scope.fbShowDetails = function () {
					fbDetailsPanel.addClass('panel-open');
				};

				$scope.fbHideDetails = function () {
					fbDetailsPanel.removeClass('panel-open');
				};

				self.sortedMode = 'Ascending'; // 'Descending' / 'Ascending'

				self.rootNode = tree.parse($scope.project.directoryStructure);
				self.selectedNode = undefined;
				self.currentNode = undefined;
				self.currentPath = undefined;
				self.unsortedFiles = undefined;
				self.unsortedDirs = undefined;
				self.currentFiles = undefined;
				self.currentDirs = undefined;

				self.selectedDirs = [];
				self.selectedFiles = [];

				self.selectedItem = undefined;

				self.setSelectedItem = function() {
					if (_.size(self.selectedDirs) === 1 && _.size(self.selectedFiles) === 0) {
						self.selectedItem = {type: 'Folder', item: self.selectedDirs[0]};
					} else if (_.size(self.selectedFiles) === 1 && _.size(self.selectedDirs) === 0) {
						self.selectedItem = {type: 'File', item: self.selectedFiles[0]};
					} else {
						self.selectedItem = undefined;
					}
				};

				self.selectedDirIndex = function(dir) {
					return _.findIndex(self.selectedDirs, function(n) { return n.model.id === dir.model.id; });
				};
				self.toggleDir = function(dir) {
					self.selectedFiles = [];// make single select for now...
					var idx = self.selectedDirIndex(dir);
					if (idx > -1) {
						_.pullAt(self.selectedDirs, idx);

					} else {
						self.selectedDirs = [];// make single select for now...
						self.selectedDirs.push(dir);
					}
					self.setSelectedItem();
				};

				self.selectedFileIndex = function(file) {
					return _.findIndex(self.selectedFiles, function(n) { return n._id.toString() === file._id.toString(); });
				};
				self.toggleFile = function(file) {
					self.selectedDirs = [];// make single select for now...
					var idx = self.selectedFileIndex(file);
					if (idx > -1) {
						_.pullAt(self.selectedFiles, idx);
					} else {
						self.selectedFiles = [];// make single select for now...
						self.selectedFiles.push(file);
					}
					self.setSelectedItem();
				};

				self.sort = function (sortMode) {
					// ascending...
					//
					self.currentFiles = _.sortBy(self.unsortedFiles,function(f) {
						return f.internalOriginalName.toLowerCase();
					});
					self.currentDirs = _.sortBy(self.unsortedDirs,function(d) {
						var name;
						d.model.name === null ? name = d.model.name : name = d.model.name.toLowerCase();
						return name;
					});
					if (sortMode === 'Descending') {
						self.currentFiles = _(self.currentFiles).reverse().value();
						self.currentDirs = _(self.currentDirs).reverse().value();
					}
				};

				self.changeSort = function () {
					// how are we sorted?
					// reverse it...
					if (self.sortedMode === 'Ascending') {
						self.sortedMode = 'Descending';
					} else {
						self.sortedMode = 'Ascending';
					}
					self.sort(self.sortedMode);
				};

				self.selectNode = function (nodeId) {
					var theNode = self.rootNode.first(function (n) {
						return n.model.id === nodeId;
					});
					if (!theNode) {
						theNode = self.rootNode;
					}
					//$log.debug('doubleClick = ', theNode.model.name);
					self.currentNode = theNode; // this is the current Directory in the bread crumb basically...
					self.currentPath = theNode.getPath() || [];
					self.unsortedFiles = [];
					self.unsortedDirs = [];
					self.currentFiles = [];
					self.currentDirs = [];
					self.selectedDirs = [];
					self.selectedFiles = [];
					$log.debug('currentNode (' + self.currentNode.model.name + ') get documents...');
					DocumentMgrService.getDirectoryDocuments($scope.project, self.currentNode.model.id)
						.then(
							function (result) {
								$log.debug('...currentNode (' + self.currentNode.model.name + ') got '+ _.size(result.data ) + '.');
								self.unsortedFiles = result.data || [];

								_.each(self.currentNode.children, function (n) {
									self.unsortedDirs.push(n);
								});

								self.sort(self.sortedMode);
								// since we loaded this, make it the selected node
								self.selectedNode = self.currentNode;
							},
							function (error) {
								$log.error('getDirectoryDocuments error: ', JSON.stringify(error));
							}
						);
				};

				self.addDisabled = function() {
					return self.selectedNode === undefined;
				};

				$scope.$on('documentMgrRefreshNode', function(event, args) {
					if (args.nodeId) {
						self.selectNode(self.currentNode.model.id);
					}
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
	.directive('documentMgrAddFolder', ['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', 'TreeModel', function ($rootScope, $modal, $log, _, DocumentMgrService, TreeModel) {
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
								self.title = "Add Folder to Project '" + $scope.project.name + "'";
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
										function (error) {
											$log.error('addDirectory error: ', JSON.stringify(error));
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
	.directive('documentMgrRenameFolder', ['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', 'TreeModel', function ($rootScope, $modal, $log, _, DocumentMgrService, TreeModel) {
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
										function (error) {
											$log.error('addDirectory error: ', JSON.stringify(error));
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

							self.title = "Upload Documents to '" + self.selectedNode.model.name + "'";
							if (self.selectedNode.model.name === 'ROOT') {
								self.title = "Upload Documents to Project '" + $scope.project.name + "'";
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
								DocumentsUploadService.startUploads(getTargetUrl(self.type), self.selectedNode.model.id, false);
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
;
