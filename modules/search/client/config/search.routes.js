'use strict';

angular.module('search')
	.config(['$stateProvider',  function ($stateProvider) {
	$stateProvider
		.state('p.search', {
			url: '/search/:searchText',
			templateUrl: 'modules/search/client/views/search.html',
			data: { },
			resolve: {
				searchText: function($stateParams) {
					return $stateParams.searchText;
				},
				results : function ($stateParams, project, SearchService) {
					console.log("BG initiate search",$stateParams.searchText, $stateParams.sortBy, $stateParams.start, $stateParams.limit);
					return SearchService.searchDocuments(project, $stateParams.searchText, $stateParams.sortBy, $stateParams.start, $stateParams.limit);
				}
			},
			controller: function($scope, project, searchText, results) {
				$scope.project = project;
				$scope.searchText = searchText;
				$scope.results = results;
				console.log("BG controller has put results into scope", results);
			}
		});

}]);

