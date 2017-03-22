'use strict';

angular.module('search').service('SearchService', searchService);


searchService.$inject = ['$http', '$state', '$rootScope'];
/* @ngInject */
function searchService($http, $state, $rootScope) {
	var self = this;
	self.searchResults;

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

	function searchDocuments(project, searchText) {
		$http({method: 'GET', url: '/api/searchDocuments?projectId=' + project._id.toString() + '&searchText=' + searchText.toString()})
			.then(function (results) {
				console.log("BG search service http returned ", results);
				self.searchResults = results.data;
				$rootScope.$broadcast('search-results-documents');
			});
	}

}
