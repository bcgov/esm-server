'use strict';
angular.module('documents')
.directive('confirmDelete', ['ConfirmDeleteService', function (ConfirmDeleteService) {
	// x-confirm-delete
	return {
		restrict: 'A',
		scope: {
			files: '=',
			folders: '=',
			project: '=',
			currentNode: '=',
			deleteCallback: '='
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				ConfirmDeleteService.confirmDialog(scope);
			});
		}
	};
}])
.service('ConfirmDeleteService', ['$rootScope', '$modal', '_', '$timeout', 'DocumentMgrService', function ($rootScope, $modal, _, $timeout, DocumentMgrService) {
	var service = this;
	service.confirmDialog = function(scope) {
		return new Promise(function(fulfill, reject) {
			$modal.open({
				animation: true,
				templateUrl: 'modules/documents/client/views/partials/modal-document-confirm-delete.html',
				resolve: {},
				size: 'lg',
				controllerAs: 'confirmDlg',
				controller: function ($scope, $modalInstance) {
					var NO_AUTH         = "Not authorized to delete";
					var WONT_PUBLISHED  = "Published content will not be deleted";
					var CANT_PUBLISHED  = "Published content cannot be deleted";
					var WONT_CONTENT    = "Folders with content will not be deleted";
					var CANT_CONTENT    = "Folders with content cannot be deleted";
					var UNDELETABLE     = 'Any content showing a warning will not be deleted.';

					var self = this;
					/*
						Set the following to true, during development, if you want to test the server side delete API.
						This will bypass the client side tests and send all selected files or folders.
						This is also a good way to test the client side error handling.
					 */
					self.testServerAPI = false;

					self.busy           = true;
					self.deleteCallback = scope.deleteCallback;
					self.currentNode    = scope.currentNode;
					self.project        = scope.project;
					self.submit         = submit;
					self.cancel         = cancel;

					// Initialize ....
					init();

					function init() {
						self.files             = collect(scope.files);
						self.folders           = collect(scope.folders);
						// the combined list is used by the ng-repeat
						self.combindedList     = self.folders.concat(self.files);
						self.deletableFolders  = _.filter(self.folders, function (item) {
							return item.canBeDeleted;
						});
						self.deletableFiles    = _.filter(self.files, function (item) {
							return item.canBeDeleted;
						});
						checkFoldersForContent()
						.then (function () {
							// repeat filter on folders
							self.deletableFolders  = _.filter(self.folders, function (item) {
								return item.canBeDeleted;
							});
							updateText();
							self.busy = false;
						});
					}

					// collect deletable folders and files
					function collect(items) {
						if (!items ) {
							return [];
						}
						// service may be invoked on a single folder or file ....
						items = Array.isArray(items) ? items : [ items ];
						var results = _.map(items, function(item) {
							var fClone = _.clone(item /* shallow clone */);
							if (fClone.type === 'File') {
								// file clone has f.isPublished and f.displayName
								fClone.userCanDelete  = item.userCan.delete;
								fClone.type           = ['png','jpg','jpeg'].indexOf(fClone.internalExt) > -1 ? 'Picture' : 'File';
							} else {
								fClone.userCanDelete  = self.project.userCan.manageFolders;
								fClone.type           = 'Folder';
								fClone.displayName    = item.model.name;
								fClone.isPublished    = item.model.published;
							}
							fClone.canBeDeleted   = fClone.userCanDelete && !fClone.isPublished;
							return fClone;
						});
						return results;
					}

					function checkFoldersForContent() {
						var promises = [];
						_.forEach(self.deletableFolders, function(fldr) {
							// Does the folder have child folders? ....
							var node = self.currentNode.first(function (child) {
								return (child.model.id === fldr.model.id);
							});
							fldr.hasChildren = node.hasChildren();
							fldr.canBeDeleted = !fldr.hasChildren;
							if (fldr.canBeDeleted) {
								// Does the folder have document content?....
								promises.push(new Promise (function (resolve, reject) {
									DocumentMgrService.getDirectoryDocuments(self.project, fldr.model.id)
									.then(function (result) {
										fldr.hasChildren = result.data.length > 0;
										fldr.canBeDeleted = !fldr.hasChildren;
										return resolve(fldr);
									})
									.catch(function (err) {
										console.log("Error", err);
										return reject(err);
									});
								}));
							}
						});
						if (promises.length === 0) {
							// Folders have no content or content is only folders
							return Promise.resolve();
						} 
						// else some folders might have document content run all promises in array
						return Promise.all(promises);
					}

					function updateText() {
						var folderCnt          = self.folders.length;
						var fileCnt            = self.files.length;
						var deletableFolderCnt = self.deletableFolders.length;
						var deletableFileCnt   = self.deletableFiles.length;
						self.allBlocked        = false;
						self.hasBlockedContent = false;

						if (deletableFolderCnt > 0 || deletableFileCnt > 0) {
							if (folderCnt > deletableFolderCnt || fileCnt > deletableFileCnt ) {
								self.hasBlockedContent = true;
								self.bannerText = "Some content has been published. Content MUST be unpublished before it can be deleted";
								self.confirmText  += " " + UNDELETABLE;
							}
							var fText            = deletableFileCnt > 1 ? "Files" : deletableFileCnt === 1 ? "File" : "";
							var fldrText         = deletableFolderCnt > 1 ? "Folders" : deletableFolderCnt === 1 ? "Folder" : "";
							var combinedText     = fText + ((fText && fldrText) ? " and " : "") + fldrText;
							var confirmText      = 'Are you sure you want to permanently delete the following ' + combinedText.toLowerCase() + '?';
							var warning          = 'This action CANNOT be undone.';
							self.title           = "Confirm Delete " + combinedText;
							self.confirmText     = confirmText + " " + warning;
							if (self.hasBlockedContent) {
								self.confirmText   += " " + UNDELETABLE;
							}
							self.showSubmit      = true;
							self.cancelText      = 'No';
						} else {
							// No files and no folders can be deleted
							self.allBlocked           = true;
							if (self.testServerAPI) {
								self.title         = "Confirm Delete API Testing";
								self.showSubmit    = true;
								self.cancelText    = 'cancel';

							} else {
								self.title         = "Published content cannot be deleted";
								self.showSubmit    = false;
								self.cancelText    = 'OK';
								self.hasBlockedContent = true;
								self.bannerText    = "Content MUST be unpublished before it can be deleted";
							}
						}
						// update the text why a user can not delete an item...
						_.forEach(self.folders, function (item) {
							setReasonForItem(item);
						});
						_.forEach(self.files, function (item) {
							setReasonForItem(item);
						});
					}

					function setReasonForItem(item) {
						if (!item.canBeDeleted) {
							item.reason = (
								!item.userCanDelete   ? NO_AUTH :
								item.isPublished      ? (self.allBlocked ? CANT_PUBLISHED : WONT_PUBLISHED) :
								item.hasChildren      ? (self.allBlocked ? CANT_CONTENT : WONT_CONTENT)     : ""
							);
						}
					}

					function cancel() {
						$modalInstance.dismiss('cancel');
					}

					function submit () {
						self.busy = true;
						var folders = self.testServerAPI ? self.folders : self.deletableFolders;
						var files = self.testServerAPI ? self.files : self.deletableFiles;
						self.deleteCallback(folders,files)
						.then(function (result) {
							self.busy = false;
							$modalInstance.close(result);
						}, function (err) {
							self.busy = false;
							self.errMsg = err.message;
							$scope.$apply();
						});
					}
				}
			});
		});
	};
}]);
