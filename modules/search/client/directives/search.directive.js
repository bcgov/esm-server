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

			self.changePageSize = changePageSize;
			self.selectItem = selectItem;

			reload();

			// if the user enters new search text the search service will notify us here when it has results.
			$rootScope.$on('search-results-documents', function() {
				reload();
			});

			function changePageSize (value) {
				self.limit = value;
			}

			function selectItem (item) {
				item.selected = ! item.selected;
			}

			function reload() {
				self.isLoading = true;
				var searchResults = SearchService.getSearchResults();
				var currentFiles = searchResults.data;
				if (!currentFiles) {
					return;
				}
				self.count = searchResults.count;

				self.start = searchResults.start;
				// prevent accidental divide by zero
				self.limit = searchResults.limit < 1 ? 1 : searchResults.limit;
				self.orderBy = searchResults.orderBy;
				//set the number of pages so the pagination can update
				self.numPages = Math.ceil(self.count / self.limit);
				self.pages = [];
				_.forEach(Array(self.numPages), function (value, index) {
					value = index * self.limit;
					self.pages.push(value);
				});
				console.log(self.pages);

				console.log("Search results directive reload, currentFiles",currentFiles);
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

		}
	};
}

directiveMainSearch.$inject = ['SearchService'];
/* @ngInject */
function directiveMainSearch(SearchService) {
	var directive = {
		restrict: 'E',
		scope: {
			project: '=',
			searchText: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/partials/search-widget.html',
		controller: function ($scope) {
			var self = this;
			self.searchText = $scope.searchText;

			self.searchTextKeyPress = function(event) {
				if (event.which === 13) {
					event.preventDefault();
					self.search();
				}
			};

			self.search = function() {
				SearchService.searchDocuments($scope.project, $scope.searchText);
			};

			self.toggleSearch = function () {
				$scope.swOpen = !$scope.swOpen;
			};

			if ($scope.searchText && self.searchText.length > 1) {
				self.search();
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