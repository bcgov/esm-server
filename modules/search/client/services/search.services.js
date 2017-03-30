'use strict';

angular.module('search').service('SearchService', searchService);

searchService.$inject = [ '$http', '$state', '$rootScope'];
/* @ngInject */
function searchService( $http, $state, $rootScope) {
	var self = this;
	self.searchResults = {};

	return {
		getSearchResults: getSearchResults,
		redirectSearchDocuments: redirectSearchDocuments,
		searchDocuments: searchDocuments
	};

	function getSearchResults () {
		return self.searchResults;
	}

	function redirectSearchDocuments(project, searchText) {
		console.log("transition to search with searchtext", searchText);
		$state.go('p.search', {projectid: project.code, searchText: searchText});
	}

	function searchDocuments(project, searchText, orderBy, start, limit) {
		start = start || 0;
		limit = limit || 10;
		orderBy = orderBy || '';
		var url =  '/api/search?collection=documents&projectId=' + project._id.toString();
		url += '&searchText=' + searchText;
		url += '&orderBy=' + orderBy;
		url += '&start=' + start;
		url += '&limit=' + limit;
		console.log("The url ", url);

		$http({method: 'GET', url: url})
			.then(function (results) {
				console.log("Search service http returned ", results);
				self.searchResults = results.data;
				self.searchResults.start = start;
				self.searchResults.limit = limit;
				self.searchResults.orderBy = orderBy;
				$rootScope.$broadcast('search-results-documents');
			});
	}

}
