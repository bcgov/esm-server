'use strict';

angular.module('search')
	.config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.search', {
			url: '/search?searchText&start&limit&orderBy&direction&collection',
			templateUrl: 'modules/search/client/views/search.html',
			data: { },
			resolve: {
				results: ['$stateParams', 'SearchService', 'project', function ($stateParams, SearchService, project) {
					var start = $stateParams.start * 1;
					var limit = $stateParams.limit * 1;
					var orderBy = $stateParams.orderBy;
					var collection = $stateParams.collection;
					var searchText = $stateParams.searchText;
					var direction = $stateParams.direction;
					return SearchService.searchDocuments(project, searchText, start, limit, orderBy, direction, collection);
				}],
				rootDirectoryNode:['SearchService', 'project', function (SearchService, project) {
					// need to have directory set up before displaying any results
					return SearchService.setupDirectoryTree(project);
				}]
			},
			controller: function($scope, project, results, rootDirectoryNode) {
				$scope.project = project;
				$scope.results = results;
				$scope.rootDirectoryNode = rootDirectoryNode;
			}
		});

}]);

