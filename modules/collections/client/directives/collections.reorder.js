"use strict";
angular.module('control')
// x-reorder-collection-modal attribute of a button
.directive("reorderCollectionModal",['$modal', '_', 'CollectionModel', 'AlertService', reorderCollectionModal])
// x-reorder-collection-content element in the modal
.directive('reorderCollectionContent', [reorderCollectionContent ])
// dnd-scroll-area a region above and below the reordering list that helps scrolling the list
.directive("dndScrollArea", dndScrollArea)
.controller("collectionsSortingController", collectionsSortingController)
;

function reorderCollectionModal($modal, _, CollectionModel, AlertService) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			onSave: '='
		},
		link: function (scope, element, attributes) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/collections/client/views/modal-collections-reorder.html',
					controllerAs: 'vmm',
					size: 'lg',
					windowClass: 'doc-sort-order-modal fs-modal',
					controller: function ($modalInstance) {
						var vmm = this;
						vmm.busy = false;
						vmm.ok = submit;
						vmm.cancel = cancel;
						vmm.collection = scope.collection;
						//deep'ish copy of original list of documents. We can sort this clone without affecting the original
						vmm.list = JSON.parse(JSON.stringify(vmm.collection.otherDocuments));
						// sort the list by sort order
						vmm.list.sort(function (doc1, doc2) {
							return doc1.sortOrder - doc2.sortOrder;
						});

						function cancel () {
							$modalInstance.dismiss('cancel');
						}
						function submit () {
							vmm.busy = true;
							var list = vmm.list;
							var ids = [];
							list.forEach(function(item) {
								ids.push(item._id);
							});
							CollectionModel.sortOtherDocuments(vmm.collection._id, ids)
							.then(function(sortedDocs) {
								AlertService.success('"'+ vmm.collection.displayName +'"' + ' was reordered successfully.');
								if (sortedDocs) {
									vmm.collection.otherDocuments = sortedDocs;
								}
								$modalInstance.close(sortedDocs);
							})
							.catch(function(res) {
								console.log("Error:", res);
								var failure = _.has(res, 'message') ? res.message : undefined;
								AlertService.error('"'+ vmm.collection.displayName +'"' + ' was not reordered');
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
						console.log("Error in reorderCollectionModal", err);
					}
				});
			});
		}
	};
}

function reorderCollectionContent() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/collections/client/views/collections-reorder-content.html',
		controller: 'collectionsSortingController',
		controllerAs: 'vm',
		scope: {
			list: '='
		}
	};
	return directive;
}


collectionsSortingController.$inject = ['$scope', '$document', '$timeout'];
/* @ngInject */
function collectionsSortingController($scope, $document, $timeout) {
	var vm = this;
	vm.dragging = false;
	vm.list = $scope.list;
	vm.getSelectedItemsIncluding = getSelectedItemsIncluding;
	vm.onDragstart = onDragstart;
	vm.onDragend = onDragend;
	vm.onDrop = onDrop;
	vm.onMoved = onMoved;
	vm.sorting = {ascending: true, column: ''};

	vm.list.forEach(function(item) {
		item.selected = false;
	});

	function getSelectedItemsIncluding(item) {
		item.selected = true;
		return vm.list.filter(function(item) {
			return item.selected;
		});
	}

	function onDragstart(event, idPrefix) {
		vm.dragging = true;
	}

	function onDragend() {
		vm.dragging = false;
	}

	function onDrop(items, index) {
		angular.forEach(items, function(item) {
			item.selected = false;
		});
		vm.list = vm.list.slice(0, index)
		.concat(items)
		.concat(vm.list.slice(index));
		vm.list.forEach(function(item,index) {
			item.sortOrder = index;
		});
		return true;
	}

	function onMoved() {
		// remove the items that were just dragged (they are still selected)
		vm.list = vm.list.filter(function(item) {
			return !item.selected;
		});
		$scope.list = vm.list;
	}
}

dndScrollArea.$inject = ['$document', '$interval'];
/* @ngInject */
function dndScrollArea($document, $interval) {
	//  <div class="dnd-scroll-area" dnd-scroll-area dnd-region="top" dnd-scroll-container="collectionList"></div>
	return {
		link: link
	};

	function link(scope, element, attributes) {
		var inc = 5 * (attributes.dndRegion === 'top' ? -1: ( attributes.dndRegion === 'bottom' ? 1 : 0));
		var container = $document[0].getElementById(attributes.dndScrollContainer);
		var speed = 10;
		if(container) {
			var timer;
			element.on('dragenter', function() {
				container.scrollTop += inc;
				timer = $interval(function moveScroll() {
					container.scrollTop += inc;
				}, speed);
			});
			element.on('dragleave', function() {
				$interval.cancel(timer);
			});
		}
	}
}
