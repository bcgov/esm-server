'use strict';

angular.module('inspectionReport').controller('InspectionReportListController', ['$scope', '$filter', 'InspectionReportModel', 'PROVINCES', '$state',
  function ($scope, $filter, InspectionReportModel, PROVINCES, $state ) {

    var listInspectionReports = this;

    InspectionReportModel.getCollection().then( function(data) {
      listInspectionReports.reportList = data;
      listInspectionReports.buildPager();
      $scope.$apply();
    }).catch( function(err) {
      $scope.error = err;
    });

    listInspectionReports.buildPager = function () {
      listInspectionReports.pagedItems = [];
      listInspectionReports.itemsPerPage = 15;
      listInspectionReports.currentPage = 1;
      listInspectionReports.figureOutItemsToDisplay();
      $scope.$apply();
    };

    listInspectionReports.figureOutItemsToDisplay = function () {
      listInspectionReports.filteredItems = $filter('filter')(listInspectionReports.reportList, {
        $: listInspectionReports.search
      });
      listInspectionReports.filterLength = listInspectionReports.filteredItems.length;
      var begin = ((listInspectionReports.currentPage - 1) * listInspectionReports.itemsPerPage);
      var end = begin + listInspectionReports.itemsPerPage;
      listInspectionReports.pagedItems = listInspectionReports.filteredItems.slice(begin, end);
    };

    listInspectionReports.pageChanged = function () {
      listInspectionReports.figureOutItemsToDisplay();
    };

    listInspectionReports.edit = function (report) {
      InspectionReportModel.setModel(report);
      $state.go('inspectionReport.edit');
    };

    listInspectionReports.add = function () {
      InspectionReportModel.getNew().then(function(res){
        InspectionReportModel.setModel(res);
        //console.log("About to leave list, model is ", InspectionReportModel.model);
        $state.go('inspectionReport.edit', {mode:"new"});
      });
    };

  }
]);
