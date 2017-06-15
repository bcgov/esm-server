"use strict";
angular
.module('documents')
.factory('CategoriesFactory', ['TreeModel', '_', CategoriesFactory ])
.controller('categorySelectModalController', categorySelectModalControllerImpl )
.controller('categorySelectController', ['CategoriesFactory', '_', '$scope', categorySelectControllerImpl ])
.directive('categoriesModal', ['$modal', categoriesDirective ]) // x-categories-modal
.directive('categoriesSelector', ['$modal', categoriesSelectorDirective ]); // x-categories-selector

// button x-categories-modal
function categoriesDirective($modal) {
	return {
		restrict: 'A',
		scope: {
			doc: '='
		},
		link: function (scope, element) {
			element.on('click', function () {
				$modal.open({
					animation: true,
					templateUrl: 'modules/documents/client/components/doc-categories/doc-categories.modal.html',
					controllerAs: 'vmm',
					size: 'lg',
					scope: scope,
					controller: 'categorySelectModalController'
				}).result
				.then( function(results) {
					scope.doc = results;
				});
			});
		}
	};
}


// controller for the modal dialog
function categorySelectModalControllerImpl($scope, $modalInstance) {
	var self = this;
	self.cancel = cancel;
	self.ok = submit;
	self.doc = $scope.doc;
	self.categories = self.doc.documentCategories;
	self.originalCategories = self.doc.documentCategories;

	function cancel() {
		$modalInstance.dismiss('cancel');
	}
	function submit() {
		var categories = self.categories;
		var hasInspectionMeta = false;
		for(var i = 0; i < categories.length; i++) {
			var cat = categories[i];
			if (cat.indexOf("Inspection ") >= 0) {
				hasInspectionMeta = true;
				break;
			}
		}
		self.doc.documentCategories = categories;
		/*
		set the computed property here to alert the caller to show extra metadata
		(note property will be reset by the server IFF this doc is saved.
		 */
		self.doc.hasInspectionMeta = hasInspectionMeta;
		if (! hasInspectionMeta ) {
			self.doc.inspectionReport = null;
		}
		$modalInstance.close(self.doc);
	}
}


// x-categories-selector  directive for the content in the modal dialog for document categories
function categoriesSelectorDirective() {
	return {
		restrict: 'E',
		scope: {
			categories: '='
		},
		templateUrl: 'modules/documents/client/components/doc-categories/doc-categories.modal-content.html',
		controller: 'categorySelectController',
		controllerAs: 'vm'
	};
}


// controller for document categories (content in modal dialog)
function categorySelectControllerImpl(CategoriesFactory, _, $scope) {
	var self = this;
	var CATEGORY_JOIN_STRING = ' > ';

	self.click = clickHandler;
	self.rootNode = CategoriesFactory;
	self.scope = $scope;

	// initialize checked state based on incoming categories set;
	initDocCategories(self.scope.categories);

	// update doc type results
	updateDocCategoriesResult();

	// init done. The following code is now function definitions.

	// clickHandler: adjust checked state of children and update overall doc type results
	function clickHandler($event) {
		// get the Node identified by the id attributed
		var t = $event.currentTarget.id;
		var nodeId = t.split('-')[1];
		nodeId = parseInt(nodeId);
		var theNode = self.rootNode.first(function (n) {
			return n.id === nodeId;
		});
		// If node is being unchecked then make sure children are unchecked.
		theNode.walk(function(child){
			var isChecked = child.checked;
			// skip the current node if it's the node we started the walk with.
			if (theNode !== child) {
				if (isChecked) {
					child.checked = false;
				}
			}
		});
		updateDocCategoriesResult();
		self.scope.categories = self.docCategoriesResult;
	}

	// updateDocCategoriesResult: walk the tree and compose categories sets.
	function updateDocCategoriesResult () {
		var allCategories = [];
		self.rootNode.walk(function (child) {
			if (child.name !== 'ROOT' && child.checked) {
				var grandChildren = child.children;
				if (grandChildren) {
					var hasCheckedChild = false;
					_.forEach(grandChildren, function (grandChild) {
						if (grandChild.checked) {
							hasCheckedChild = true;
							return false;
						}
					});
					if (!hasCheckedChild) {
						var cats = composeCategoriesForNode(child);
						allCategories.push(cats);
					}
				}
			}
		});
		self.docCategoriesResult = allCategories;
	}

	// initDocCategories: initialize check state for incoming categories set
	function initDocCategories(initialDocCategories) {
		self.rootNode.walk( function (child) {
			var dt = composeCategoriesForNode(child);
			_.forEach( initialDocCategories, function (idt) {
				if (idt === dt) {
					var path = child.getPath();
					_.forEach( path, function(p) { p.checked = true; });
				}
			});
		});
	}

	// composeCategoriesForNode: create categories set based on check state of tree nodes
	function composeCategoriesForNode(node) {
		var path = node.getPath();
		var dtResult = [];
		path.shift();
		_.forEach(path, function(p) {
			dtResult.push(p.model.name);
		});
		dtResult = dtResult.join(CATEGORY_JOIN_STRING);
		return dtResult;
	}
}


// Producer of document categories
function CategoriesFactory(TreeModel, _) {
	var self = this;
	self.rootNode = undefined;
	var categories = getCategories().categories;
	sortCategories(categories);
	self.rootNode = initTree(categories);
	return self.rootNode;

	// sortCategories: before creating the tree sort the children
	function sortCategories(categories) {
		var queue = [categories];
		(function sort() {
			var i, cnt, cats;
			if (queue.length === 0) {
				return;
			}
			cats = queue.shift();
			for (i = 0, cnt = cats.children.length; i < cnt; i++) {
				queue.push(cats.children[i]);
			}
			cats.children = _.sortBy(cats.children, function(c) { return c.name; } );
		})();
	}

	// initTree: create the category tree from categories factory
	function initTree (categories) {
		var rn = (new TreeModel()).parse(categories);
		// copy id and name from model onto tree node to keep code clean and simple to read.
		rn.walk( function(child) {
			child.id = child.model.id;
			child.name = child.model.name;
		});
		return rn;
	}

	function getCategories() {
		var sid = 0;
		function createId() {
			return sid++;
		}
		// Be careful that each element has an ID or tree traversals will fail.
		var level3 = function() {
			return [
				{
					id: createId(),
					name: 'Health & Safety',
					children: [
						{
							id: createId(),
							name: 'Occupational Health',
							children: [{
								id: createId(),
								name: 'Ergonomics'
							}]
						}
					]
				}, {
					id: createId(),
					name: 'Permitting'
				}, {
					id: createId(),
					name: 'Reclamation',
					children: [{
						id: createId(),
						name: 'Environmental Geoscience'
					}]
				}, {
					id: createId(),
					name: 'Geotechnical'
				}, {
					id: createId(),
					name: 'Electrical'
				}, {
					id: createId(),
					name: 'Mechanical'
				}];
		};
		var mainCategories = {
			id: createId(),
			name: 'ROOT',
			children: [
				{
					id: createId(),
					name: 'Annual Report',
					children: [{
						id: createId(),
						name: 'Annual Reclamation Report'
					}]
				}, {
					id: createId(),
					name: 'Inspection Report',
					children: level3()
				}, {
					id: createId(),
					name: 'Inspection Report Response',
					children: level3()
				}, {
					id: createId(),
					name: 'Inspection Follow Up',
					children: level3()
				}, {
					id: createId(),
					name: 'Geotechnical',
					children: [{
						id: createId(),
						name: 'Dam Safety Inspection Report'
					}, {
						id: createId(),
						name: 'Dam Safety Review'
					}]
				}, {
					id: createId(),
					name: 'Authorizations'
				}, {
					id: createId(),
					name: 'Management Plan'
				}, {
					id: createId(),
					name: 'Application Document'
				}, {
					id: createId(),
					name: 'Correspondence'
				},
				{
					id: createId(),
					name: 'Order',
					children: [{
						id: createId(),
						name: 'Order issued under the Mines Act'
					}, {
						id: createId(),
						name: 'Order issued under the Environmental Management Act'
					},	{
						id: createId(),
						name: 'Order issued under the Environmental Assessment Act'
						}]
				}, {
					id: createId(),
					name: 'Other'
				}]
			};
		return {categories: mainCategories};
	}
}
