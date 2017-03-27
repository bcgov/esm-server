'use strict';

angular.module('search').service('SearchService', searchService);

console.log("BG SearchService");

searchService.$inject = [ '$http', '$state', '$rootScope'];
/* @ngInject */
function searchService( $http, $state, $rootScope) {
	var self = this;
	self.searchResults = [];

	return {
		getSearchResults: getSearchResults,
		redirectSearchDocuments: redirectSearchDocuments,
		searchDocuments: searchDocuments
	};

	function getSearchResults () {
		return self.searchResults;
	}

	function redirectSearchDocuments(project, searchText) {
		$state.transitionTo('p.search', {projectid: project.code, searchText: searchText}, {
			reload: true, inherit: false, notify: true
		});
	}

	function searchDocuments(project, searchText, start, limit) {
		start = start || 0;
		limit = limit || 10;
		//console.log("SearchDocuments", project._id.toString(), searchText, start, limit);
		var url =  '/api/searchDocuments?projectId=' + project._id.toString();
		url += '&searchText=' + searchText.toString();
		url += '&start=' + start;
		url += '&limit=' + limit;

		$http({method: 'GET', url: url})
			.then(function (results) {
				console.log("Search service http returned ", results);
				self.searchResults = results.data;
				$rootScope.$broadcast('search-results-documents');
			});
	}

}
