'use strict';
angular.module('documents')

	.directive('documentMgr', ['_', 'DocumentMgrService', 'TreeModel', 'ProjectModel', 'Document', function (_, DocumentMgrService, TreeModel, ProjectModel, Document) {
		return {
			restrict: 'E',
			scope: {
				project: '=',
				documents: '='
			},
			templateUrl: 'modules/documents/client/views/document-manager.html',
			controller: function ($scope, $log, _, DocumentMgrService, TreeModel, ProjectModel, Document) {
				var tree = new TreeModel();
				var self = this;

				$scope.project.directoryStructure = $scope.project.directoryStructure || {
						id: 1,
						lastId: 1,
						name: 'ROOT'
					};

				self.sortedMode = 'Ascending'; // 'Descending' / 'Ascending'

				self.rootNode = tree.parse($scope.project.directoryStructure);
				self.currentNode = undefined;
				self.currentPath = undefined;
				self.unsortedFiles = undefined;
				self.unsortedDirs = undefined;
				self.currentFiles = undefined;
				self.currentDirs = undefined;

				self.sort = function(sortMode) {
					// ascending...
					self.currentFiles = _.sortBy(self.unsortedFiles, ['name']);
					self.currentDirs = _.sortBy(self.unsortedDirs, ['name']);
					if (sortMode === 'Descending') {
						self.currentFiles = _(self.currentFiles).reverse().value();
						self.currentDirs = _(self.currentDirs).reverse().value();
					}
				};

				self.changeSort = function() {
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
					var selectedNode = self.rootNode.first(function (n) {
						return n.model.id === nodeId;
					});
					if (!selectedNode) {
						selectedNode = self.rootNode;
					}

					self.currentNode = selectedNode;
					self.currentPath = selectedNode.getPath() || [];
					self.unsortedFiles = [];
					self.unsortedDirs = [];
					self.currentFiles = [];
					self.currentDirs = [];

					_.each($scope.documents, function(d) {
						if (_.isEmpty(d.directoryID)){
							// orphans go to root...
							d.directoryID = self.rootNode.model.id;
						}
						if (d.directoryID === nodeId) {
							self.unsortedFiles.push(d);
						}
					});
					_.each(self.currentNode.children, function(n) {
						self.unsortedDirs.push(n);
					});
					self.sort(self.sortedMode);
				};

				self.entryText = '';
				self.addDirectory = function () {
					if (_.isEmpty(self.entryText)) {
						alert('Name is required to create a new Directory');
						return;
					}
					var node = self.currentNode || self.rootNode;
					DocumentMgrService.addDirectory($scope.project, node, self.entryText)
						.then(
							function (result) {
								self.rootNode = tree.parse(result.data);
								self.selectNode(node.model.id);
								self.entryText = '';
							},
							function (error) {
								$log.debug('addDirectory error: ', JSON.stringify(error));
							}
						);
				};
				self.renameDirectory = function () {
					if (!self.currentNode) {
						// need a node...  message...
						alert('No directory selected, cannot rename');
						return;
					}
					if (_.isEmpty(self.entryText)) {
						alert('New name is required to rename a Directory');
						return;
					}
					if (self.currentNode.model.id === 1) {
						// can't delete root
						alert('Cannot rename ROOT');
						return;
					}
					DocumentMgrService.renameDirectory($scope.project, self.currentNode, self.entryText)
						.then(
							function (result) {
								self.rootNode = tree.parse(result.data);
								self.selectNode(self.currentNode.model.id);
								self.entryText = '';
							},
							function (error) {
								$log.debug('renameDirectory error: ', JSON.stringify(error));
							}
						);
				};
				self.removeDirectory = function () {
					if (!self.currentNode) {
						// need a node...  message...
						alert('No directory selected');
						return;
					}
					if (self.currentNode.model.id === 1) {
						// can't delete root
						alert('Cannot remove ROOT');
						return;
					}
					// cannot drop root
					// check for documents, prompt if not empty
					// get parent node...
					var parentNode = self.currentNode.parent || self.rootNode;
					DocumentMgrService.removeDirectory($scope.project, self.currentNode)
						.then(
							function (result) {
								self.rootNode = tree.parse(result.data);
								self.selectNode(parentNode.model.id);
								self.entryText = '';
							},
							function (error) {
								$log.debug('removeDirectory error: ', JSON.stringify(error));
							}
						);
				};
				self.moveDirectory = function () {
					// this will be done via drag drop, not textual lookup...
					var destNode = self.rootNode.first(function (n) {
						return n.model.name === self.entryText;
					});
					if (!destNode) {
						// need a node...  message...
						alert('Destination directory "' + self.entryText + '" not found.');
						return;
					}
					if (!self.currentNode) {
						// need a node...  message...
						alert('No directory selected to move.');
						return;
					}
					if (self.currentNode.model.id === 1) {
						// can't delete root
						alert('Cannot rename ROOT');
						return;
					}
					DocumentMgrService.moveDirectory($scope.project, self.currentNode, destNode)
						.then(
							function (result) {
								self.rootNode = tree.parse(result.data);
								self.selectNode(destNode.model.id);
								self.entryText = '';
							},
							function (error) {
								$log.debug('moveDirectory error: ', JSON.stringify(error));
							}
						);
				};

				var refreshDocuments = function() {
					Document.getProjectDocuments($scope.project._id, 'false')
						.then(
							function(data) {
								$scope.documents = data;
							},
							function(error) {
								$log.debug('refreshDocuments error: ', JSON.stringify(error));
							}
						);
				};

				// set it up at the root...
				self.selectNode(self.rootNode.model.id);
			},
			controllerAs: 'documentMgr'
		};
	}])

;
