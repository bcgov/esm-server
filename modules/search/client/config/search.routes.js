'use strict';

angular.module('search').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.search', {
			url: '/search/:searchText',
			templateUrl: 'modules/search/client/views/search.html',
			data: { },
			resolve: {
				searchText: function($stateParams) {
					return $stateParams.searchText;
				}
			},
			controller: function($scope, project, searchText) {
				$scope.project = project;
				$scope.searchText = searchText;
				// Used to start the documentUI in a specific folder location.
				console.log("BG search route window.location.search", project.code, searchText);
				//$scope.search = window.location.search;
			}
		});

}]);

