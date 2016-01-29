'use strict';

angular.module('users.admin').controller('OrganizationsListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    /*Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });*/
    $scope.organizations = [
      {name: "Organization 1",location: "Location 1", memberCount: "1" },
      {name: "Organization 2",location: "Location 2", memberCount: "2" },
      {name: "Organization 3",location: "Location 3", memberCount: "3" },
    ]  ;

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
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
