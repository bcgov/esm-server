'use strict';

angular.module('search')
	.service('SearchService', searchService)
	.service('SearchResultsService', searchResultsService);

searchService.$inject = [ '$http', '$state', '$rootScope', '$timeout', '_', 'ProjectModel', 'TreeModel'];
/* @ngInject */
function searchService( $http, $state, $rootScope, $timeout, _, ProjectModel, TreeModel) {
	var self = this;
	self.searchResults = {};
	self.searchText = '';
	self.rootNode = null;

	return {
		getSearchText: getSearchText,
		getSearchResults: getSearchResults,
		setupDirectoryTree: setupDirectoryTree,
		redirectSearchDocuments: redirectSearchDocuments,
		composeFilePath: composeFilePath,
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

	function setupDirectoryTree (project) {
		var tree = new TreeModel();
		return ProjectModel.getProjectDirectory(project)
		.then(function (dir) {
			project.directoryStructure = dir || {
					id: 1,
					lastId: 1,
					name: 'ROOT',
					published: true
				};
			self.rootNode = tree.parse(project.directoryStructure);
			return self.rootNode;
		});
	}

	function composeFilePath(directoryID, fileName) {
		var path = '';
		if (self.rootNode) {
			var theNode = self.rootNode.first(function (n) {
				return n.model.id === directoryID;
			});
			var pathSet = theNode ? theNode.getPath() || [] : [];
			_.forEach(pathSet, function (element) {
				var n = element.model.name;
				if (n !== 'ROOT') {
					path += "/" + n;
				}
			});
		}
		path += "/" + fileName;
		return path;
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

		return $http({method: 'GET', url: url})
		.then(function (results) {
			self.searchResults.searchText = searchText;
			self.searchResults.data = results.data.data;
			self.searchResults.count = results.data.count;
			self.searchResults.start = start;
			self.searchResults.limit = limit;
			self.searchResults.orderBy = orderBy;
			self.searchResults.direction = direction;
			return self.searchResults;
		});
	}
}



searchResultsService.$inject = [];
/* @ngInject */
function searchResultsService( ) {
	var service = this;
	service.openFile = openFile;

	function openFile(docId) {
		var url = window.location.protocol + "//" + window.location.host + "/api/document/" + docId + "/fetch";
		window.open(url, "_blank");
	}

}