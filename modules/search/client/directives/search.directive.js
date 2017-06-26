'use strict';

angular.module('search')
	.directive('mainSearchWidget', directiveMainSearch)
	.directive('modalSearchInstructions', directiveModalSearchInstructions)
	.directive('searchInfoPanel', directiveSearchInfoPanel)
	.directive('searchResultsDocument', searchResultsDocumentDirective);

directiveSearchInfoPanel.inject = ['Authentication', 'CodeLists'];
function directiveSearchInfoPanel(Authentication, CodeLists) {
	return {
		restrict: 'E',
		scope: {
			parentController: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/search-info-panel.html',
		controller: function ($scope) {
			var self = this;
			self.authentication = Authentication;
			self.documentTypes = CodeLists.documentTypes;
			self.close = closePanel;

			$scope.$on('itemSelected', function (event, item) {
				self.item = item;
				self.doc = item ? item.doc : null;
			});
			self.parent = $scope.parentController;

			function closePanel() {
				self.parent.toggleInfoPanel();
			}
		}
	};
}

searchResultsDocumentDirective.$inject = ['_', 'AlertService', 'SearchService', 'SearchResultsService', '$rootScope', 'Authentication',  'ProjectModel'];
/* @ngInject */
function searchResultsDocumentDirective(_, AlertService, SearchService, SearchResultsService, $rootScope, Authentication, ProjectModel) {
	return {
		restrict: 'E',
		scope: {
			project: '=',
			results: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/search-results-documents.html',
		controller: function ($scope) {
			var self = this;
			self.authentication = Authentication;
			self.colspan = (self.authentication.user) ? 5 : 3;
			self.isLoading = false;
			self.limit = 10;
			self.pageSizes = [10, 20, 50, 100];
			self.currentFiles = [];
			self.infoPanelOpen = false;

			// methods
			self.changePageSize = changePageSize;
			self.openFile = SearchResultsService.openFile;
			self.toggleSelectItem = toggleSelectItem;
			self.selectItem = selectItem;
			self.selectPage = selectPage;
			self.sortBy = sortBy;
			self.toggleInfoPanel = toggleInfoPanel;

			self.copyClipboardSuccess = function(e) {
				var txt = e.trigger.getAttribute('data-doc-name');
				AlertService.success('Link copied for ' + txt);
				e.clearSelection();
			};

			self.copyClipboardError = function(e) {
				AlertService.error('Copy link failed.');
			};
			// init
			reload($scope.results);
			// end of configuration
			// helper functions ...

			function reload(searchResults) {
				self.isLoading = true;
				//var searchResults = SearchService.getSearchResults();
				self.currentFiles = searchResults.data;
				if (!self.currentFiles) {
					return;
				}
				self.searchText = searchResults.searchText;
				self.count = searchResults.count;
				self.start = searchResults.start;
				self.limit = searchResults.limit;
				self.orderBy = searchResults.orderBy;
				self.direction = searchResults.direction;
				initializeSorting();
				initializePagination();
				self.displayResults = [];
				_.forEach(self.currentFiles, function (item) {
					var displayItem = {};
					displayItem.isFile = true;
					displayItem.id = item._id;
					displayItem.link = window.location.protocol + "//" + window.location.host + "/api/document/" + displayItem.id  + "/fetch";
					displayItem.path = SearchService.composeFilePath(item.directoryID, item.displayName);
					displayItem.displayName = item.displayName;
					displayItem.description = item.description;
					displayItem.isPublished = item.isPublished;
					displayItem.dateUploaded = item.dateUploaded;
					displayItem.selected = false;
					displayItem.doc = item;
					self.displayResults.push(displayItem);
				});
				self.isLoading = false;
				//$scope.$apply();
			}

			function toggleInfoPanel() {
				self.infoPanelOpen = !self.infoPanelOpen;
			}

			function toggleSelectItem(item) {
				// select/unselect a file, make it the only item selected...
				var checked = item.selected;
				if (!checked) {
					_.forEach(self.displayResults, function (o) {
						o.selected = false;
					});
					item.selected = true;
					var selectedItem = item;
					$scope.$broadcast('itemSelected', selectedItem);
				}
			}

			function selectItem(item) {
				// select a file, make it the only item selected...
				var checked = item.selected;
				_.forEach(self.displayResults, function (o) {
					o.selected = false;
				});
				item.selected = !checked;
				var selectedItem = item.selected  ? item : null;
				$scope.$broadcast('itemSelected', selectedItem);
			}

			function changePageSize(value) {
				self.limit = value;
				SearchService.redirectSearchDocuments($scope.project, self.searchText, self.start, self.limit, self.orderBy);
			}

			function sortBy(column) {
				switch (column) {
					case 'name':
						if (self.orderBy === 'displayName') {
							self.direction = self.direction === 'asc' ? 'desc' : 'asc';
						} else {
							self.direction = 'asc';
							self.orderBy = 'displayName';
						}
						break;
					case 'date':
						if (self.orderBy === 'dateUploaded') {
							self.direction = self.direction === 'asc' ? 'desc' : 'asc';
						} else {
							self.direction = 'asc';
							self.orderBy = 'dateUploaded';
						}
						break;
					case 'status':
						if (self.orderBy === 'isPublished') {
							self.direction = self.direction === 'asc' ? 'desc' : 'asc';
						} else {
							self.direction = 'asc';
							self.orderBy = 'isPublished';
						}
						break;
				}
				self.start = 0;
				SearchService.redirectSearchDocuments($scope.project, self.searchText, self.start, self.limit, self.orderBy, self.direction);
			}

			function initializeSorting() {
				self.sorting = {};
				self.sorting.ascending = self.direction === 'asc' ? 'ascending' : 'descending';
				switch (self.orderBy) {
					case 'displayName':
						self.sorting.column = 'name';
						break;
					case 'dateUploaded':
						self.sorting.column = 'date';
						break;
					case 'isPublished':
						self.sorting.column = 'status';
						break;
				}
			}

			function selectPage(page) {
				self.start = Math.abs((page - 1) * self.limit);
				SearchService.redirectSearchDocuments($scope.project, self.searchText, self.start, self.limit, self.orderBy, self.direction);
			}

			function initializePagination() {
				// prevent accidental divide by zero
				self.limit = Math.max(1, self.limit);
				//set the number of pages so the pagination can update
				self.numPages = Math.ceil(self.count / self.limit);
				self.currentPage = Math.ceil(self.start / self.limit) + 1;
				var start = 1;
				var paginationDisplaySize = 7;
				var middle = Math.floor(paginationDisplaySize / 2);
				var end;
				var i;
				start = Math.max(start, self.currentPage - middle);
				end = start + paginationDisplaySize;
				if (end > self.numPages) {
					end = self.numPages + 1;
					start = Math.max(1, end - paginationDisplaySize);
				}
				self.pages = [];
				for (i = start; i < end; i++) {
					self.pages.push(i);
				}
				//console.log("currentPage, start, numPages, pages.indexOf(numPages), pages.indexOf(numPages -1)", self.currentPage, self.start, self.numPages, self.pages.indexOf(self.numPages), self.pages.indexOf(self.numPages -1));
			}
		}
	};
}

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Main search widget
//
// -----------------------------------------------------------------------------------
directiveMainSearch.$inject = ['SearchService'];
/* @ngInject */
function directiveMainSearch(SearchService) {
	var directive = {
		restrict: 'E',
		scope: {
			project: '=',
			preload: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/partials/search-widget.html',
		controller: function ($scope, $rootScope) {
			var self = this;
			self.busy = false;
			self.searchText = $scope.preload ? SearchService.getSearchText() : '';
			self.search = search;
			self.toggleSearch = toggleSearch;
			self.searchTextKeyPress = searchTextKeyPress;

			$rootScope.$on('search-text-changed', function () {
				self.searchText = SearchService.getSearchText();
			});

			function searchTextKeyPress(event) {
				if (event.which === 13) {
					event.preventDefault();
					if (self.searchText.length > 1) {
						self.search();
					}
				}
			}

			function search() {
				self.busy = true;
				SearchService.redirectSearchDocuments($scope.project, self.searchText);
			}

			function toggleSearch() {
				$scope.swOpen = !$scope.swOpen;
			}
		}
	};
	return directive;
}


// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Display instructions for user
//
// -----------------------------------------------------------------------------------
directiveModalSearchInstructions.$inject = ['$modal'];
/* @ngInject */
function directiveModalSearchInstructions($modal) {
	var directive = {
		restrict: 'A',
		scope: {
		},
		link: function (scope, element, attrs) {
			element.on('click', function () {
				var modalInstructions = $modal.open({
					animation: true,
					templateUrl: 'modules/search/client/views/partials/modal-search-instructions.html',
					controller: 'controllerModalSearchInstructions',
					controllerAs: 'instruct',
					size: 'lg'
				});
				modalInstructions.result.then(function (data) {
					// do nothing
				}, function () {
				});
			});
		}
	};
	return directive;
}