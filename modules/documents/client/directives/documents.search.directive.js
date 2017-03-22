'use strict';
angular.module('documents')
	.directive('documentSearchWidget', ['_', 'DocumentMgrService', function (_, DocumentMgrService) {
		return {
			restrict: 'E',
			scope: {
				project: '='
			},
			templateUrl: 'modules/documents/client/views/partials/document-search-widget.html',
			controller: function ($scope) {
				var self = this;
				self.searchText = '';

				self.search = search;

				self.searchTextKeyPress = function (event) {
					if (event.which === 13) {
						event.preventDefault();
						self.search();
					}
				};

				function search() {
					console.log("BG do search");
					DocumentMgrService.searchDocuments($scope.project, self.searchText)
						.then(
							function (result) {
								console.log("search results", result);
							},
							function (err) {
								//$log.error('renameDirectory error: ', JSON.stringify(err));
								console.log("Search failed", err);
							}
						);
				}
			},
			controllerAs: 'docSearch'
		};
	}]);
