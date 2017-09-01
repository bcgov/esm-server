"use strict";
angular.module('control')
.directive("reorderDocumentsModal", // x-reorder-documents-modal
		['$modal', '$timeout', '_', 'AlertService', 'ConfirmService', 'moment', 'FolderModel', 'Document', reorderDocumentsModal])
.directive('reorderDocumentsContent', // x-reorder-documents-content
		[reorderDocumentsContent ])
.controller("documentsSortingController", documentsSortingController);

function reorderDocumentsModal($modal, $timeout, _,  AlertService, ConfirmService, moment, FolderModel, Document) {
	var CUSTOM     = 'custom',
		DATE         = 'date',
		NAME         = 'name',
		DOCUMENT     = 'document',
		FOLDER       = 'folder',
		ASCENDING    = 'ascending',
		DESCENDING   = 'descending',
		ASC          = 'asc',
		DESC         = 'desc',
		TITLE        = "Please confirm",
		WARNING      = "Warning",
		CONFIRM_CUST = "This will override any custom sorting.",
		CONFIRM_APP  = "All subfolders will be sorted by %option%. This will override any custom sorting.";
	return {
		restrict: 'A',
		scope: {
			options:      '=',
			currentPath:  '=',
			folder:       '=',
			onSave:       '='
		},
		link: function (scope, element, attributes) {
			element.on('click', function () {
				$modal.open({
					animation:     true,
					templateUrl:   'modules/documents/client/views/partials/modal-document-reorder.html',
					controllerAs:  'vmm',
					size:          'lg',
					backdrop:      'static',
					keyboard:      false,
					windowClass:   'doc-sort-order-modal fs-modal',
					controller: function ($modalInstance) {
						var self                  = this;
						self.busy                 = false;
						self.ok                   = submit;
						self.cancel               = cancel;
						self.setDefaultSortOrder  = setDefaultSortOrder;
						self.applySort            = applySort;
						self.checkSelectItem      = checkSelectItem;
						self.onSaveCallback       = scope.onSave;
						self.currentPath          = scope.currentPath;
						self.options              = scope.options;
						self.folder               = scope.folder;
						self.sorting              = {};
						self.applyToChildren      = false;
						self.documents            = { id: DOCUMENT, allowedTypes: [DOCUMENT], items: []};
						self.folders              = { id: FOLDER, allowedTypes: [FOLDER], items: []};
						self.pendingSubfolders    = 0;
						loadDocumentsAndFolders();
						var column             = self.folder.defaultSortField,
							defaultSortDirection = self.folder.defaultSortDirection,
							key                  = composeKey(column, defaultSortDirection);
						applySort(key, column, defaultSortDirection);

						// UI is ready for user. Load the subfolders in the background.
						$timeout(loadSubfolders,0);

						// what follows are the helper functions...

						function loadDocumentsAndFolders () {
							//deep'ish copy of original list of documents. We can sort this without affecting the original
							_.forEach(self.options.documents, function (doc) {
								var d = {};
								d._id = doc._id;
								d.displayName = doc.displayName;
								d.documentDate = doc.dateUploaded; // EPIC uses dateUploaded MEM uses documentDate
								d.documentDateDisplayMnYr = doc.documentDateDisplayMnYr;
								d.isPublished = doc.isPublished;
								d.type = DOCUMENT;
								self.documents.items.push(d);
							});
							_.forEach(self.options.folders, function (doc) {
								var d = {};
								d._id = doc.model.folderObj._id;
								d.displayName = doc.model.name;
								d.documentDate = null;
								d.documentDateDisplayMnYr = false;
								d.order = doc.model.order;
								d.isPublished = doc.model.published;
								d.type = FOLDER;
								self.folders.items.push(d);
							});
						}

						function composeKey(column, direction) {
							var key;
							if (column === NAME) {
									key = NAME + '-' + direction;
							}
							if (column === DATE) {
								key = DATE + '-' + direction;
							}
							if (column === CUSTOM) {
								key = CUSTOM;
							}
							return key;
						}

						function setDefaultSortOrder (sortKey) {
							var column, defaultSortDirection;
							switch(sortKey) {
								case 'date-asc':
									column = DATE;
									defaultSortDirection = ASC;
									break;
								case 'date-desc':
									column = DATE;
									defaultSortDirection = DESC;
									break;
								case 'name-asc':
									column = NAME;
									defaultSortDirection = ASC;
									break;
								case 'name-desc':
									column = NAME;
									defaultSortDirection = DESC;
									break;
								case CUSTOM:
									column = CUSTOM;
									defaultSortDirection = '';
									break;
							}
							if (self.sorting.column === CUSTOM && column !== CUSTOM) {
								ConfirmService.confirmDialog({
									titleText: WARNING,
									confirmText: CONFIRM_CUST,
									onOk: function () {
										_.forEach(self.folders.items, function (item) {
											item.selected = false;
										});
										_.forEach(self.documents.items, function (item) {
											item.selected = false;
										});
										self.applySort(sortKey, column, defaultSortDirection);
										return Promise.resolve();
									},
									onCancel: function () {
										// restore radio buttons ...
										self.defaultSortColumn = self.sorting.sortKey;
										return Promise.resolve();
									}
								});
							} else {
								self.applySort(sortKey, column, defaultSortDirection);
							}
						}

						function checkSelectItem (listHolder, item) {
							if (self.customSorting) {
								var listId = listHolder.id;
								var theOtherListHolder = listId === FOLDER ? self.documents : self.folders;
								var list = listHolder.items;
								if (item.selected === false) {
									// user wants to select this item
									if (theOtherListHolder.isActive) {
										_.forEach(theOtherListHolder.items, function (other) {
											other.selected = false;
										});
										theOtherListHolder.isActive = false;
									}
									item.selected = true;
									listHolder.isActive = true;
								} else {
									// user wants to unselect this item. But now that one item is unselected
									// do we need to deactivate the list?
									item.selected = false;
									var found = _.find(list, function (a) {
										return a.selected;
									});
									if (!found) {
										listHolder.isActive = false;
									}
								}
							}
						}

						function applySort(sortKey, column, defaultSortDirection) {
							self.busy = true;
							self.sorting.sortKey              = sortKey;
							self.defaultSortColumn            = sortKey;
							self.sorting.column               = column;
							self.sorting.defaultSortDirection = defaultSortDirection;
							if (column === CUSTOM) {
								self.sortDescription = '';
								self.customSorting   = true;
								self.applyToChildren = false;

							} else {
								self.sortDescription = self.sorting.column + ' ' + (defaultSortDirection === ASC ? ASCENDING : DESCENDING);
								self.customSorting   = false;
							}
							var direction = self.sorting.defaultSortDirection === ASC ? 1 : -1;
							var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
							if (self.sorting.column === NAME) {
								self.documents.items.sort(function (d1, d2) {
									var v = collator.compare(d1.displayName, d2.displayName);
									return v * direction;
								});
								self.folders.items.sort(function (d1, d2) {
									var v = collator.compare(d1.displayName, d2.displayName);
									return v * direction;
								});
							} else if (self.sorting.column === DATE) {
								self.documents.items.sort(function(doc1, doc2){
									/*
									 Sort by date but account for the case the display value is like June 2017.
									 We want to group all June 2017 docs before any like 2017-01-01.
									 */
									var d1 = doc1.documentDate ? {d: moment(doc1.documentDate), my: doc1.documentDateDisplayMnYr} : undefined;
									var d2 = doc2.documentDate ? {d: moment(doc2.documentDate), my: doc2.documentDateDisplayMnYr} : undefined;
									if (d1 && d2 && d1.d.isSame(d2.d,'month')) {
										if (d1.my && d2.my) {
											return (d1.d.valueOf() - d2.d.valueOf()) * direction;
										} else if (d1.my) {
											return -1 * direction;
										}  else if (d2.my) {
											return 1 * direction;
										}
									}
									d1 = d1 ? d1.d.valueOf() : 0;
									d2 = d2 ? d2.d.valueOf() : 0;
									return (d1 - d2) * direction;
								});
							}
							self.busy = false;
						}

						function loadSubfolders() {
							/*
							The project directory structure only has the skelton of the folder structure. This skelton
							only has the actual folder objects for the immediate children of the parent folder. But when
							we need to apply the sort options to all subfolders we'll need to have the folder object
							for each.   In this function we walk the tree looking for any subfolder models that need
							the actual folder object. This code can be ripped out if the over all system collects these
							subfolders somewhere else (e.g. on page load).
							 */
							var theKids = [];
							var node = self.currentPath[self.currentPath.length-1];
							node.walk( function (child) {
								theKids.push(child);
							});
							_.forEach(theKids, function (child) {
								if (!child.model.hasOwnProperty('folderObj')) {
									// console.log("This child needs folder obj", child.model.name);
									self.pendingSubfolders++;
									FolderModel.lookup(self.folder.project, child.model.id)
									.then(function (folder) {
										child.model.folderObj = folder;
										self.pendingSubfolders--;
									});
								}
							});
						}

						function cancel (event) {
							if (self.customSorting) {
								ConfirmService.confirmDialog({
									titleText: WARNING,
									confirmText: CONFIRM_CUST,
									onOk: function () {
										$modalInstance.dismiss('cancel');
										return Promise.resolve();
									},
									onCancel: function () {
										return Promise.resolve();
									}
								});
							} else {
								$modalInstance.dismiss('cancel');
							}
						}

						function submit () {
							if (self.applyToChildren) {
								ConfirmService.confirmDialog({
									titleText: WARNING,
									confirmText: CONFIRM_APP.replace('%option%',self.sortDescription),
									onOk: function () {
										self.busy = true;
										function wait(){
											if (self.pendingSubfolders === 0 ){
												submitWorker();
											} else {
												// the subfolder loading has not yet completed ...
												// it is highly unlikely this will happen but we must wait ...
												// Yes, display a console message in case something has gone wrong.
												console.log("Waiting for subfolders to load " +self.pendingSubfolders+ " folders to go");
												$timeout(wait,500);
											}
										}
										wait();
										// close the confirmation dialog
										return Promise.resolve();
									},
									onCancel: function () {
										return Promise.resolve();
									}
								});
							} else {
								submitWorker();
							}
						}

						function submitWorker () {
							self.busy = true;
							self.folder.defaultSortField = self.sorting.column;
							self.folder.defaultSortDirection = 	self.sorting.defaultSortDirection;
							return FolderModel.save(self.folder)
							.then (function(result) {
								var list = self.folders.items;
								if (list.length === 0) {
									return Promise.resolve();
								}
								var ids = [];
								list.forEach(function(item) {
									ids.push(item._id);
								});
								return FolderModel.sortFolders(self.folder.project, self.folder.directoryID, ids);
							})
							.then(function(result) {
								var list = self.documents.items;
								if (list.length === 0) {
									return Promise.resolve();
								}
								var ids = [];
								list.forEach(function(item) {
									ids.push(item._id);
								});
								return Document.sortDocuments(self.folder.project, self.folder.directoryID, ids);
							})
							.then(function(result){
								if (self.applyToChildren) {
									var theKids = [];
									var node = self.currentPath[self.currentPath.length-1];
									node.walk( function (child) {
										theKids.push(child);
									});
									var folderPromises = _.map(theKids, function(child) {
										var folder = child.model.folderObj;
										folder.defaultSortField = self.sorting.column;
										folder.defaultSortDirection = 	self.sorting.defaultSortDirection;
										//console.log("Save sort to folder " + folder.displayName);
										return FolderModel.save(folder);
									});
									return Promise.all(folderPromises);
								}
								else {
									return Promise.resolve(true);
								}
							})
							.then(function(result) {
								AlertService.success('Folder changes saved');
								if (self.onSaveCallback) {
									self.onSaveCallback();
								}
								self.busy = false;
								$modalInstance.close(self.folder);
							})
							.catch(function(res) {
								console.log("Error:", res);
								var failure = _.has(res, 'message') ? res.message : '';
								AlertService.error('Changes not saved. ' + failure);
								self.busy = false;
								$modalInstance.close();
							});
						}
					}
				}).result
				.then (function() {
					if (scope.onSave) {
						scope.onSave();
					}
				})
				.catch(function (err) {
					if ('cancel' !== err && 'backdrop click' !== err) {
						console.log("Error in reorderDocumentsModal", err);
					}
				});
			});
		}
	};
}

function reorderDocumentsContent() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/documents/client/views/partials/document-reorder-content.html',
		controller: 'documentsSortingController',
		controllerAs: 'vm',
		scope: {
			list:   '=',
			title:  '=',
			parent: '='
		}
	};
	return directive;
}


documentsSortingController.$inject = ['$scope', '$document', '$timeout'];
/* @ngInject */
function documentsSortingController($scope, $document, $timeout) {
	var self                       = this;
	self.dragging                  = false;
	self.list                      = $scope.list;
	self.parent                    = $scope.parent;
	self.sectionTitle              = $scope.title;
	self.getSelectedItemsIncluding = getSelectedItemsIncluding;
	self.onDragstart               = onDragstart;
	self.onDragend                 = onDragend;
	self.onDrop                    = onDrop;
	self.onMoved                   = onMoved;
	self.onSelect                  = onSelect;
	self.sorting                   = {};

	self.list.items.forEach(function(item) {
		item.selected = false;
	});

	function getSelectedItemsIncluding(item) {
		item.selected = true;
		var list = self.list.items.filter(function(item) {
			return item.selected;
		});
		return list;
	}

	function onSelect(item) {
		self.parent.checkSelectItem(self.list, item);
		return true;
	}

	function onDragstart(event, idPrefix) {
		self.dragging = true;	
		return false;
	}

	function onDragend() {
		self.dragging = false;
	}

	function onDrop(items, index) {
		angular.forEach(items, function(item) {
			item.selected = false;
		});
		self.list.items = self.list.items.slice(0, index)
		.concat(items)
		.concat(self.list.items.slice(index));
		self.list.items.forEach(function(item,index) {
			item.order = index;
		});
		return true;
	}

	function onMoved() {
		// remove the items that were just dragged (they are still selected)
		self.list.items = self.list.items.filter(function(item) {
			return !item.selected;
		});
	}
}

