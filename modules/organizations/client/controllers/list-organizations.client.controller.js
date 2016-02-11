'use strict';

angular.module('organizations').controller('OrganizationsListController', ['$scope', '$filter', 'Organizations', 'PROVINCES',
  function ($scope, $filter, Organizations, PROVINCES) {

    var listOrganizations = this;

    listOrganizations.provs = PROVINCES;

    Organizations.getOrganizations().then(function (data) {
      $scope.organizations = data.data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.organizations, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };

  }
]);
