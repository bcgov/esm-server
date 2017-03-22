'use strict';
angular.module('documents')
	.directive('documentMgrLink', ['_', 'moment', 'Authentication', 'DocumentMgrService', 'AlertService', 'TreeModel', 'ProjectModel', 'Document', function (_, moment, Authentication, DocumentMgrService, AlertService, TreeModel, ProjectModel, Document) {
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
						name: 'ROOT',
						published: true
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
;
