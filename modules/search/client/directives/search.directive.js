'use strict';

angular.module('search')
	.directive('mainSearchWidget', directiveMainSearch)
	.directive('modalSearchInstructions', directiveModalSearchInstructions)
	.directive('searchResultsDocument', searchResultsDocumentDirective);


searchResultsDocumentDirective.$inject = ['_', 'SearchService', '$rootScope'];
/* @ngInject */
function searchResultsDocumentDirective(_, SearchService, $rootScope) {
	return {
		restrict: 'E',
		scope: {
			project: '='
		},
		controllerAs: 'vm',
		templateUrl: 'modules/search/client/views/search-results-documents.html',
		controller: function ($scope, Authentication) {
			var self = this;
			self.busy= false;
			self.authentication = Authentication;
			self.currentFiles = SearchService.getSearchResults();
			// default sort is by name ascending...
			self.sorting = {
				column: 'name',
				ascending: true
			};

			// if the user enters new search text the search service will notify us here when it has results.
			$rootScope.$on('search-results-documents', function() {
				self.currentFiles = SearchService.getSearchResults();
			});

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
			self.search = search;
			self.searchTextKeyPress = searchTextKeyPress;

			if (self.searchText && self.searchText.length > 1) {
				self.search();
			}

			function searchTextKeyPress (event) {
				if (event.which === 13) {
					event.preventDefault();
					self.search();
				}
			};

			function search() {
				SearchService.searchDocuments($scope.project, self.searchText);
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
