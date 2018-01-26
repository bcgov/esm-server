'use strict';

angular.module('inspectionReport').controller('editInspectionReportController', ['$scope', '$state', 'InspectionReportModel', 'InspectionReportDetailModel', '_',
  function ($scope, $state, InspectionReportModel, InspectionReportDetailModel, _ ) {
    var editInspectionReport = this;
    editInspectionReport.reportOpen = true;
    editInspectionReport.addDetailOpen = false;

    editInspectionReport.report = InspectionReportModel.model;

    // if no model is set, go to the list to choose.
    if (editInspectionReport.report === null) {$state.go("inspectionReport.list");}

    // Handles the cancel button...
    editInspectionReport.cancel = function() {
      $state.go("inspectionReport.list");
    };

    // Handles the submit button on the form.
    editInspectionReport.submitInspectionReport = function() {
      // IMPORTANT! if new: InspectionReportModel.add(editInspectionReport.report).then(
      InspectionReportModel.saveModel().then(
        function(/* res */) {
          editInspectionReport.reportOpen = false;
          $scope.$apply();
        },
        // If the ID is wrong let's go back to the list.
        function(/* data */) {
          alert("There was a problem saving the form.");
          $state.go("inspectionReport.list");
        }
      );
    };

    // Handles the "Edit Inspection Report" button to open it for editing.
    editInspectionReport.openReport = function () {
      editInspectionReport.reportOpen = true;
    };

    // Handles the "Add Inspection Detail" button
    editInspectionReport.openDetailForm = function() {
      InspectionReportDetailModel.getNew().then(
        function(res) {
          editInspectionReport.newDetail = res;
          editInspectionReport.addDetailOpen = true;
          $scope.$apply();
        }
      );
    };

    // Handles the "Save New Inspection Detail" button
    editInspectionReport.saveNewDetail = function(detail) {
      InspectionReportDetailModel.saveModel(detail).then(
        function(/* res */) {
          editInspectionReport.report.inspectionDetails.push(detail);
          InspectionReportModel.saveModel(editInspectionReport.report).then(
            function(res) {
              editInspectionReport.report = res;
              editInspectionReport.addDetailOpen = false;
              $scope.$apply();
            }
          );
        }
      );
    };

    // Handles the "Remove" button on Details...
    editInspectionReport.removeDetail = function(detail) {
      InspectionReportDetailModel.delete(detail._id).then(
        function(/* res */) {
          _.remove(editInspectionReport.report.inspectionDetails, detail);
          InspectionReportModel.saveModel(editInspectionReport.report).then(
            function(res) {
              editInspectionReport.report = res;
              $scope.$apply();
            }
          );
        }
      );
    };

    // Handles the "Edit" button on Details...
    editInspectionReport.editDetail = function(detail) {
      var index = _.indexOf(editInspectionReport.report.inspectionDetails, detail);
      InspectionReportDetailModel.setModel(editInspectionReport.report.inspectionDetails[index]);
      editInspectionReport.report.inspectionDetails[index].editMode = true;
      editInspectionReport.report.inspectionDetails[index].copy = InspectionReportDetailModel.getCopy();
    };

    // Handles the "Update" button on Details...
    editInspectionReport.updateDetail = function(detail) {
      var index = _.indexOf(editInspectionReport.report.inspectionDetails, detail);

      InspectionReportDetailModel.saveCopy(detail.copy).then(function(res){
        editInspectionReport.report.inspectionDetails[index] = res;
        editInspectionReport.report.inspectionDetails[index].editMode = false;
        $scope.$apply();
      });
    };
  }
]);
