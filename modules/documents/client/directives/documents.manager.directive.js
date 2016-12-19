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

				self.selectedDirIndex = function(dir) {
					return _.findIndex(self.selectedDirs, function(n) { return n.model.id === dir.model.id; });
				};
				self.toggleDir = function(dir) {
					var idx = self.selectedDirIndex(dir);
					if (idx > -1) {
						_.pullAt(self.selectedDirs, idx);
					} else {
						self.selectedDirs.push(dir);
					}
				};

				self.selectedFileIndex = function(file) {
					return _.findIndex(self.selectedFiles, function(n) { return n._id.toString() === file._id.toString(); });
				};
				self.toggleFile = function(file) {
					var idx = self.selectedFileIndex(file);
					if (idx > -1) {
						_.pullAt(self.selectedFiles, idx);
					} else {
						self.selectedFiles.push(file);
					}
				};

				self.sort = function (sortMode) {
					// ascending...
					//
					self.currentFiles = _.sortBy(self.unsortedFiles,function(f) {
						return f.internalOriginalName.toLowerCase();
					});
					self.currentDirs = _.sortBy(self.unsortedDirs,function(d) {
						return d.model.name.toLowerCase();
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
	.directive('documentMgrUploadModal',['$rootScope', '$modal', '$log', '_', 'DocumentMgrService', function ($rootScope, $modal, $log, _, DocumentMgrService){
		return {
			restrict: 'A',
			scope: {
				project: '=',
				root: '=',
				node: '=',
				type: '='
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

							$scope.project = scope.project;
							$scope.node = scope.node || scope.root;

							self.rootNode = scope.root;
							self.selectedNode = scope.node;
							self.type = scope.type;

							self.uploading = false;
							self.enableUpload = false;

							// Document upload complete so close and continue.
							$scope.$on('documentMgrUploadComplete', function(event, args) {
								if (args.completed > 0) {
									// if there were any completed, we should refresh the node to show them.
									$rootScope.$broadcast('documentMgrRefreshNode', {nodeId: self.selectedNode.model.id});
								}
								if (args.failed === 0) {
									// only close if there are no errors?
									$modalInstance.close();
								}
								self.uploading = false;
							});

							$scope.$on('documentMgrEnableUpload', function (event, args) {
								self.enableUpload = args.enableUpload;
							});

							self.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							self.startUploads = function () {
								$scope.$broadcast('documentMgrUploadStart', false);
								self.uploading = true;
							};

							self.cancelUploads = function () {
								$scope.$broadcast('documentMgrUploadCancel', false);
								// when all outstanding uploads are cancelled, it should sent a documentMgrUploadComplete message handled above.
							};

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
	.directive('documentMgrUpload', ['$rootScope', '$timeout', '$log', 'Upload', '_', 'DocumentMgrService', 'Document', function ($rootScope, $timeout, $log, Upload, _) {
		return {
			restrict: 'E',
			scope: {
				project: '=',
				root: '=',
				node: '=',
				type: '=',
				parentId: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager-upload.html',
			controller: function ($rootScope, $scope, $timeout, $log, Upload, _) {
				var self = this;

				var getTargetUrl = function(type) {
					var t = type || 'project';
					// determine URL for upload, default to project if none set.
					if (t === 'comment' && $scope.parentId) {
						return '/api/commentdocument/publiccomment/' + $scope.parentId + '/upload';
					}
					if (t === 'project' && $scope.project) {
						return '/api/document/' + $scope.project._id + '/upload';
					}
				};


				$scope.project = $scope.project;
				$scope.node = $scope.node || $scope.root;

				self.rootNode = $scope.root;
				self.selectedNode = $scope.node;

				self.inProgress = false;
				self.inProgressFiles = [];
				self.fileList = [];
				self.targetUrl = getTargetUrl($scope.type);
				self.cancelled = false;

				/*
				self.progress = {
					working: false,
					completed: false,
					files: [],
					uploaded: [],
					failed: [],
					cancelled: []
				}
				*/

				$scope.$watch('files', function (newValue) {
					if (newValue) {
						self.inProgress = false;
						_.each(newValue, function(file, idx) {
							self.fileList.push(file);
						});
					}
					self.checkEnableUpload();
				});

				$scope.$on('documentMgrUploadStart', function(event, uploadingReviewDocs) {
					if (!self.inProgress) {
						self.upload(uploadingReviewDocs);
					}
				});

				$scope.$on('documentMgrUploadCancel', function(event) {
					if (self.inProgress) {
						self.cancelAll();
					}
				});

				self.removeFile = function(f) {
					_.remove(self.fileList, f);
					self.checkEnableUpload();
				};

				self.cancelFile = function(file) {
					if (Upload.isUploadInProgress() && file && file.status === 'In Progress') {
						//$log.debug('Uploading in progress, upload cancel requested for file: ', file.$$hashKey.toString());
						file.upload.abort();
					}
				};

				self.cancelAll = function() {
					if (Upload.isUploadInProgress()) {
						//$log.debug('Uploading in progress, but cancel all requested...');
						_.each(self.inProgressFiles, function(file) {
							self.cancelFile(file);
						});
					} else {
						self.checkEnableUpload();
					}
				};

				self.checkEnableUpload = function () {
					if (self.fileList.length > 0) {
						$rootScope.$broadcast('documentMgrEnableUpload',  { enableUpload: true });
					} else {
						$rootScope.$broadcast('documentMgrEnableUpload',  { enableUpload: false });
					}
				};

				self.checkInProgressStatus = function() {
					// if non in progress, close?
					var inProgress = _.filter(self.inProgressFiles, function(f) { return 'In Progress' === f.status; });
					var completed = _.filter(self.inProgressFiles, function(f) { return 'Completed' === f.status; });
					var failed = _.filter(self.inProgressFiles, function(f) { return f.status && f.status.startsWith('Failed: '); });
					var cancelled = _.filter(self.inProgressFiles, function(f) { return 'Cancelled' === f.status; });
					if (_.size(inProgress) === 0){
						self.inProgress = false;
						$scope.$emit('documentMgrUploadComplete', {completed: _.size(completed), failed: _.size(failed), cancelled: _.size(cancelled) });
					}
				};

				self.upload = function(uploadingReviewDocs) {
					self.inProgress = true;
					self.inProgressFiles = [];
					if (self.fileList && self.fileList.length && self.targetUrl) {
						angular.forEach( self.fileList, function(file) {
							// Quick hack to pass objects
							// console.log("docUpload",docUpload);
							if (undefined === self.typeName) self.typeName = "Not Specified";
							if (undefined === self.subTypeName) self.subTypeName = "Not Specified";
							if (undefined === self.folderName) self.folderName = "Not Specified";

							file.status = undefined;
							file.upload = Upload.upload({
								url: self.targetUrl,
								file: file,
								headers: {
									'documenttype': self.typeName,
									'documentsubtype': self.subTypeName,
									'documentfoldername': self.folderName,
									'documentisinreview': uploadingReviewDocs,
									'directoryid' : self.selectedNode.model.id
								}
							});
							$log.debug('Add to inProgressFiles: ', file.$$hashKey.toString());
							self.inProgressFiles.push(file);

							file.upload.then(function (response) {
								$timeout(function () {
									file.result = response.data;
									file.progress = 100;
									file.status = 'Completed';
									self.checkInProgressStatus();
								});
							}, function (response) {
								if (response.status > 0) {
									$log.error(response.status + ': ' + response.data);
									self.errorMsg = response.status + ': ' + response.data;
									file.status = 'Failed: ' + response.data;
								} else {
									// abort was called...
									$log.debug('cancelled ' + file.$$hashKey.toString());
									file.status = 'Cancelled';
								}
								self.checkInProgressStatus();
							}, function (evt) {
								// if we get a cancel request, then call
								file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
								file.status = 'In Progress';
							});
						});

					} else {
						self.checkInProgressStatus();
					}
				};

			},
			controllerAs: 'documentMgrUpload'
		};
	}])
;
