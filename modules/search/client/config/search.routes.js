'use strict';

angular.module('search')
	.config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.search', {
			url: '/search?searchText&start&limit&orderBy&collection',
			templateUrl: 'modules/search/client/views/search.html',
			data: { },
			resolve: {
				results: ['$stateParams', 'SearchService', 'project', function ($stateParams, SearchService, project) {
					var start = $stateParams.start * 1;
					var limit = $stateParams.limit * 1;
					var orderBy = $stateParams.orderBy;
					var collection = $stateParams.collection;
					var searchText = $stateParams.searchText;
					return SearchService.searchDocuments(project, searchText, start, limit, orderBy, collection);
				}]
			},
			controller: function($scope, project, results) {
				$scope.project = project;
				$scope.results = results;
				console.log("BG controller has put results into scope", results);
			}
		});

}]);

