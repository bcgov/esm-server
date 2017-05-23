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
							var project = self.project 	= scope.project;
							self.doc 			= scope.doc;
							self.selectNode 	= selectNode;
							self.cancel 			= cancelClickHandler;
							self.select 			= okClickHandler;

							self.rootNode = tree.parse(project.directoryStructure);
							self.selectNode(self.rootNode);

							function selectNode(dir) {
								var theNode = self.rootNode.first(function (n) {
									return n.model.id === dir.model.id;
								});
								// currentDir is the current target for the move
								self.currentDir = theNode;
								// currentPath displayed in breadcrumbs in modal
								self.currentPath = theNode.getPath() || [];
								// currentDirs displayed in folder list in modal
								self.currentDirs = theNode.children;
								var path = _.map(self.currentPath, function(dir) {
									return dir.model.name === 'ROOT' ? '' : dir.model.name;
								}).join("/");
								// currentPathName used in confirmation dialog
								self.currentPathName = path === 0 ? '/' : path;
							}

							function cancelClickHandler() {
								$modalInstance.dismiss('cancel');
							}

							function okClickHandler () {
								self.busy = true;
								var msg = '';
								self.doc.directoryID = self.currentDir.model.id;
								return Document.save(self.doc)
								.then(function (result) {
									msg = self.doc.displayName + ' moved to ' + self.currentPathName;
								}, function (err) {
									msg = self.doc.displayName + ' could not be moved. Error: ' + err;
								})
								.then(function() {
									return Document.getDropZoneDocuments(self.project._id);
								})
								.then(function(dropZoneFiles) {
									self.project.dropZoneFiles = dropZoneFiles;
									self.busy = false;
									console.log(msg);
									AlertService.success( msg );
									$modalInstance.close(msg);
								});
							}
						} // end controller
					});
				});
			}
		};
	}])
;
