'use strict';
angular.module('documents')
	.directive('documentSearchWidget', documentSearchWidgetDirective);

documentSearchWidgetDirective.$inject = ['_', 'SearchService'];
/* @ngInject */
function documentSearchWidgetDirective(_, SearchService) {
	return {
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

			self.searchTextKeyPress = function (event) {
				if (event.which === 13) {
					event.preventDefault();
					self.search();
				}
			};

			function search() {
				SearchService.redirectSearchDocuments($scope.project, self.searchText);
			}
		}
	};
}
