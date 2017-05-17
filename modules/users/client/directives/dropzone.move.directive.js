'use strict';
angular.module('documents')
	// x-drop-zone-move
	.directive('dropZoneMove', ['$rootScope', '$modal', '_', 'TreeModel', 'ProjectModel', 'Document', 'AlertService',
		function ($rootScope, $modal, _, TreeModel, ProjectModel, Document, AlertService) {
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
					ProjectModel.getProjectDirectory(scope.project)
					.then(function(directoryStructure) {
						directoryStructure = directoryStructure || {
								id: 1,
								lastId: 1,
								name: 'ROOT',
								published: true
							};
						$modal.open({
						animation: true,
						size: 'lg',
						windowClass: 'fb-browser-modal',
						templateUrl: 'modules/users/client/views/user-partials/dropzone-move.html',
						resolve: {},
						controllerAs: 'moveDlg',
						controller: function ($scope, $modalInstance) {
							var self = this;
							var tree = new TreeModel();
							var project = self.project 	= scope.project;
							self.doc 			= scope.doc;
							self.selectNode 	= selectNode;
							self.cancel 			= cancelClickHandler;
							self.select 			= okClickHandler;
							self.docDescription = self.doc.description;

							self.rootNode = tree.parse(directoryStructure);
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
								self.doc.description = self.docDescription;
								return Document.save(self.doc)
								.then(function (result) {
									msg = self.doc.displayName + ' moved to ' + self.currentPathName;
								}, function (err) {
									msg = self.doc.displayName + ' could not be moved. Error: ' + err;
								})
								.then(function() {
									$rootScope.$broadcast('dropZoneRefresh');
									self.busy = false;
									AlertService.success( msg );
									$modalInstance.close(msg);
								});
							}
						} // end controller
					});
					});
				});
			}
		};
	}])
;
