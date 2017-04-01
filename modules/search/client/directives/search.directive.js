'use strict';

angular.module('search')
	.directive('mainSearchWidget', directiveMainSearch)
	.directive('modalSearchInstructions', directiveModalSearchInstructions)
	.directive('searchResultsDocument', searchResultsDocumentDirective);


searchResultsDocumentDirective.$inject = ['_', 'SearchService', '$rootScope', 'Authentication'];
/* @ngInject */
function searchResultsDocumentDirective(_, SearchService, $rootScope, Authentication) {
	return {
		restrict: 'E',
		scope: {
			project: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/search-results-documents.html',
		controller: function ($scope) {
			var self = this;
			self.authentication = Authentication;
			self.colspan = (self.authentication.user) ? 5 : 3;
			self.isLoading= false;
			self.limit = 10;
			self.pageSizes= [10, 20, 50, 100];

			self.changePageSize = changePageSize;
			self.selectItem = selectItem;
			self.selectPage = selectPage;
			self.sortBy = sortBy;

			reload();

			// When the search results are resolved ....
			$rootScope.$on('search-results-documents', function() {
				reload();
			});

			function changePageSize (value) {
				self.limit = value;
				SearchService.redirectSearchDocuments($scope.project, self.searchText, self.start, self.limit, self.orderBy);
			}

			function selectItem (item) {
				item.selected = ! item.selected;
			}

			function sortBy (column) {
				switch(column) {
					case 'name':
						if (self.orderBy === 'displayName') {
							self.direction = self.direction==='asc' ? 'desc' : 'asc';
						} else {
							self.direction = 'asc';
							self.orderBy = 'displayName';
						}
						break;
					case 'date':
						if (self.orderBy === 'dateUploaded') {
							self.direction = self.direction==='asc' ? 'desc' : 'asc';
						} else {
							self.direction = 'asc';
							self.orderBy = 'dateUploaded';
						}
						break;
					case 'status':
						if (self.orderBy === 'isPublished') {
							self.direction = self.direction==='asc' ? 'desc' : 'asc';
						} else {
							self.direction = 'asc';
							self.orderBy = 'isPublished';
						}
						break;
				}
				self.start = 0;
				SearchService.redirectSearchDocuments($scope.project, self.searchText, self.start, self.limit, self.orderBy, self.direction);
			}


			function selectPage(page) {
				self.start = Math.abs((page -1) * self.limit);
				SearchService.redirectSearchDocuments($scope.project, self.searchText, self.start, self.limit, self.orderBy, self.direction);
			}

			function reload() {
				self.isLoading = true;
				var searchResults = SearchService.getSearchResults();
				var currentFiles = searchResults.data;
				if (!currentFiles) {
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
				_.forEach(currentFiles, function (item) {
					var displayItem = {};
					displayItem.isFile = true;
					displayItem.id = item._id;
					displayItem.isImage = ['png','jpg','jpeg'].includes(item.internalExt);
					displayItem.displayName = item.displayName;
					displayItem.description = item.description;
					displayItem.isPublished = item.isPublished;
					displayItem.dateUploaded = item.dateUploaded;
					displayItem.selected = false;
					displayItem.doc = item;
					self.displayResults.push(displayItem);
				});
				self.isLoading = false;
			}

			function initializeSorting () {
				self.sorting={};
				self.sorting.ascending = self.direction === 'asc' ? 'ascending' : 'descending';
				switch(self.orderBy) {
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

			function initializePagination() {
				// prevent accidental divide by zero
				self.limit = Math.max(1,self.limit);
				//set the number of pages so the pagination can update
				self.numPages = Math.ceil(self.count / self.limit);
				self.currentPage = Math.ceil(self.start / self.limit) + 1;
				console.log("currentPage", self.currentPage, self.start);
				var start = 1;
				var paginationDisplaySize = 6;
				var end;
				var i;
				start = Math.max(start, self.currentPage - paginationDisplaySize / 2);
				end = start + paginationDisplaySize;
				if (end > self.numPages) {
					end = self.numPages + 1;
					start = Math.max(1, end - paginationDisplaySize);
				}
				self.pages = [];
				for (i = start; i < end; i++) {
					self.pages.push(i);
				}
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
			project: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/partials/search-widget.html',
		controller: function ($scope) {
			var self = this;
			self.searchText = '';
			self.search = search;
			self.toggleSearch = toggleSearch;
			self.searchTextKeyPress = searchTextKeyPress;

			function searchTextKeyPress (event) {
				if (event.which === 13) {
					event.preventDefault();
					if (self.searchText.length > 1) {
						self.search();
					}
				}
			}

			function search() {
				SearchService.redirectSearchDocuments($scope.project, self.searchText);
			}

			function toggleSearch () {
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
		restrict:'A',
		scope: {
			project: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalInstructions = $modal.open({
					animation: true,
					templateUrl: 'modules/search/client/views/partials/modal-search-instructions.html',
					controller: 'controllerModalSearchInstructions',
					controllerAs: 'instruct',
					size: 'lg'
				});
				modalInstructions.result.then(function (data) {
					// do nothing
				}, function () {});
			});
		}
	};
	return directive;
}