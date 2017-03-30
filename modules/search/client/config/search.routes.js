'use strict';

angular.module('search')
	.config(['$stateProvider', '$locationProvider',  function ($stateProvider, $locationProvider) {
	$stateProvider
		.state('p.search', {
			url: '/search',
			templateUrl: 'modules/search/client/views/search.html',
			data: { },
			resolve: {
				results : function ($location, project, SearchService) {
					var start = $location.search().start * 1;
					var limit = $location.search().limit  * 1;
					var orderBy = $location.search().orderBy;
					var collection = $location.search().collection;
					var searchText = $location.search().searchText;
					console.log("What is in the query string?", $stateProvider);// $location.search());
					return SearchService.searchDocuments(project, searchText, orderBy, start, limit);
				}
			},
			controller: function($scope, project, results) {
				$scope.project = project;
				$scope.results = results;
				console.log("BG controller has put results into scope", results);
			}
		});

}]);

