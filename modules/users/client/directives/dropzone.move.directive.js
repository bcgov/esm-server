'use strict';
angular.module('documents')
// x-drop-zone-move
// TODO clean out needed injections
	.directive('dropZoneMove', ['$rootScope', '$modal', '$log', '$timeout', '$animate', '_', 'moment', 'Authentication', 'DocumentMgrService', 'TreeModel', 'ProjectModel', 'Document', 'AlertService',
		function ($rootScope, $modal, $log, $timeout, $animate, _, moment, Authentication, DocumentMgrService, TreeModel, ProjectModel, Document, AlertService) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				doc: '='
			},
			resolve: {
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						size: 'lg',
						windowClass: 'fb-browser-modal',
						templateUrl: 'modules/users/client/views/user-partials/dropzone-move.html',
						resolve: {},
						controllerAs: 'moveDlg',
						controller: function ($rootScope, $scope, $modalInstance) {
							var self = this;
							var tree = new TreeModel();

							self.busy = false;

							var project = self.project 	= scope.project;
							var projectName = project.name;
							var doc 		= self.doc 			= scope.doc;

							self.sorting = {column: 'name', ascending: true};

							self.rootNode = tree.parse(project.directoryStructure);

							self.currentDirs = self.rootNode.children;
							self.currentDir = self.rootNode;
							self.currentPath = self.currentDir.getPath() || [];
							self.selectedName = self.currentDir.model.name === 'ROOT' ? self.project.name : self.currentDir.model.name;
							console.log("currentDirs", self.currentDirs);
							console.log("project.directoryStructure", project.directoryStructure);
							console.log("rootnode", self.rootNode);
							self.selectDir 		= selectNode; //selectDirClickHandler
							self.openDir 			= selectNode; //openDirClickHandler;
							self.selectNode 	= selectNode;
							self.cancel 			= cancelClickHandler;
							self.select 			= selectClickHandler;
							self.back 				= backClickHandler;
							self.move 				= moveClickHandler;

							function selectNode(dir) {
								// self.busy = true;
								console.log("selectNode", dir.model.name);
								var theNode = self.rootNode.first(function (n) {
									return n.model.id === dir.model.id;
								});
								if (!theNode) {
									theNode = self.rootNode;
								}
								console.log("theNode", theNode.model.name);

								self.currentDir = theNode; // this is the current Directory in the bread crumb basically...
								// self.folderURL = window.location.protocol + "//" + window.location.host + "/p/" + self.project.code + "/docs?folder=" + theNode.model.id;
								self.currentPath = theNode.getPath() || [];
								console.log("self.currentPath", self.currentPath);

								self.currentDirs = theNode.children;
								self.currentDir = theNode;
								self.currentDirName = theNode.model.name;
								self.selectedName = self.currentDirName === 'ROOT' ? projectName : self.currentDirName;


								// //$log.debug('currentNode (' + self.currentNode.model.name + ') get documents...');
								// DocumentMgrService.getDirectoryDocuments(self.project, theNode.model.id)
								// 	.then(
								// 		function (result) {
								// 			console.log("result", result);
								// 			$log.debug('...currentNode (' + self.currentDir.model.name + ') got '+ _.size(result.data ) + '.');
								// 			self.selectedName = self.currentDir.model.name === 'ROOT' ? self.project.name : self.currentDir.model.name;
								//
								// 			self.busy = false;
								// 		},
								// 		function (error) {
								// 			$log.error('getDirectoryDocuments error: ', JSON.stringify(error));
								// 			self.busy = false;
								// 		}
								// 	);
							};


							function cancelClickHandler() {
								$modalInstance.dismiss('cancel');
							}

							function selectClickHandler() {
								self.view = 'move';
							}

							function backClickHandler () {
								self.view = 'select';
							}

							function moveClickHandler (destination) {
								if (!destination) {
									return Promise.reject('Destination required for moving file.');
								} else {
									self.doc.directoryID = destination.model.id;
									return Document.save(f)
									.then(function (result) {
										self.busy = false;
										AlertService.success('The drop zone file was moved.');
									}, function (err) {
										self.busy = false;
										AlertService.error("The file could not be moved.");
									}).then(function (ok) {
										$modalInstance.close(self.selectedDir);
									});
								}
							}

							function selectDirClickHandler (dir) {
								// selected a dir, make it the only item selected...
								var checked = dir.selected;
								_.each(self.currentDirs, function (o) {
									o.selected = false;
								});
								_.each(self.currentFiles, function (o) {
									o.selected = false;
								});
								dir.selected = !checked;
							}
						}
					}).result
						.then(function (data) {
							$log.debug(data);
						})
						.catch(function (err) {
							$log.error(err);
						});
				});
			}
		};
	}])
;
