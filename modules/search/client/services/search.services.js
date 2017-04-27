'use strict';

angular.module('search').service('SearchService', searchService);

searchService.$inject = [ '$http', '$state', '$rootScope', '$timeout'];
/* @ngInject */
function searchService( $http, $state, $rootScope, $timeout) {
	var self = this;
	self.searchResults = {};
	self.searchText = '';

	return {
		getSearchText: getSearchText,
		getSearchResults: getSearchResults,
		redirectSearchDocuments: redirectSearchDocuments,
		searchDocuments: searchDocuments
	};

	function setSearchText(searchText) {
		self.searchText = searchText;
		$timeout(function() {
			$rootScope.$broadcast('search-text-changed');
		},100);
	}

	function getSearchText () {
		return self.searchText;
	}

	function getSearchResults () {
		return self.searchResults;
	}

	function redirectSearchDocuments(project, searchText, start, limit, orderBy, direction, collection) {
		//console.log("transition to search with searchText", searchText, start, limit, orderBy);
		setSearchText(searchText);
		$state.go('p.search', {
			projectid: project.code,
			searchText: searchText,
			collection: collection,
			start: start,
			limit: limit,
			orderBy: orderBy,
			direction: direction
		});
	}

	function searchDocuments(project, searchText, start, limit, orderBy, direction, collection) {
		setSearchText(searchText);
		start = start || 0;
		limit = limit || 10;
		orderBy = orderBy || '';
		collection = collection || 'documents';
		var url =  '/api/search?projectId=' + project._id.toString();
		url += '&searchText=' + searchText;
		url += '&orderBy=' + orderBy;
		url += '&direction=' + direction;
		url += '&start=' + start;
		url += '&limit=' + limit;
		url += '&collection=' + collection;
		//console.log("The url ", url);

		$http({method: 'GET', url: url})
			.then(function (results) {
				self.searchResults.searchText = searchText;
				self.searchResults.data = results.data.data;
				self.searchResults.count = results.data.count;
				self.searchResults.start = start;
				self.searchResults.limit = limit;
				self.searchResults.orderBy = orderBy;
				self.searchResults.direction = direction;
				$timeout(function() {
					$rootScope.$broadcast('search-results-documents');
				},10);
			});
	}

}
