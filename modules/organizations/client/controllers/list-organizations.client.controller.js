'use strict';

angular.module('organizations').controller('OrganizationsListController', ['$scope', '$filter', 'OrganizationModel', 'PROVINCES',
	function ($scope, $filter, sOrganizationModel, PROVINCES) {

		var listOrganizations = this;

		listOrganizations.provs = PROVINCES;

		sOrganizationModel.getCollection().then(function (data) {
			listOrganizations.organizations = data;
			listOrganizations.buildPager();
		});

		listOrganizations.buildPager = function () {
			listOrganizations.pagedItems = [];
			listOrganizations.itemsPerPage = 15;
			listOrganizations.currentPage = 1;
			listOrganizations.figureOutItemsToDisplay();
		};

		listOrganizations.figureOutItemsToDisplay = function () {
			listOrganizations.filteredItems = $filter('filter')(listOrganizations.organizations, {
				$: listOrganizations.search
			});
			listOrganizations.filterLength = listOrganizations.filteredItems.length;
			var begin = ((listOrganizations.currentPage - 1) * listOrganizations.itemsPerPage);
			var end = begin + listOrganizations.itemsPerPage;
			listOrganizations.pagedItems = listOrganizations.filteredItems.slice(begin, end);
		};

		listOrganizations.pageChanged = function () {
			listOrganizations.figureOutItemsToDisplay();
		};

	}
]);
