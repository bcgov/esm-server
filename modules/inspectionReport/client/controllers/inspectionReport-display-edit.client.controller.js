'use strict';

angular.module('inspectionReport').controller('controllerInspectionReportDisplayEdit', ['$scope', '$filter', 'InspectionReportModel', 'InspectionReportDetailModel', '$state', 'PROVINCES', 'COMPANY_TYPES',
    function ($scope, $filter, InspectionReportModel, InspectionReportDetailModel, $state, PROVINCES, COMPANY_TYPES ) {
        var displayEdit = this;
        displayEdit.details = [];
        displayEdit.detailsToDelete = [];
        displayEdit.inspectionReportId = $scope.inspectionReportId;
        displayEdit.mode = $scope.mode;

        $scope.$watch('mode', function(newMode) {
            if (newMode) {
                displayEdit.mode = newMode;
            }
        });
        $scope.$watch('inspectionReportId', function(newInspectionReportId) {
            if (newInspectionReportId) {
                displayEdit.inspectionReportId = newInspectionReportId;
            }
        });

        displayEdit.provs = PROVINCES;
        displayEdit.companyTypes = COMPANY_TYPES;

        // Is this a new entry? If so, let's create it...
        if (displayEdit.mode === "add") {
            InspectionReportModel.getNew().then(
                function(res) {
                    displayEdit.inspectionReport = res;
                    $scope.$apply();
                }
            );
        } else
        // If this isn't a new entry,
        {
            InspectionReportModel.getModel(displayEdit.inspectionReportId).then(
                function(res) {
                    console.log(res);

                    displayEdit.inspectionReport = res;
                    //displayEdit.details = displayEdit.inspectionReport.inspectionDetails;
                    $scope.$apply();
                },
                // If the ID is wrong let's go back to the list.
                function(data) {
                    $state.go('inspectionReport.list');
                }
            );
        }

        displayEdit.submit = function() {

            angular.forEach(displayEdit.detailsToDelete, function (value,key) {
                // remove it from the DB
               // InspectionReportDetailModel.delete(value);
            });

            //displayEdit.inspectionReport.inspectionDetails = [];

            function saveListItem(index) {
                var myDetail = displayEdit.inspectionReport.inspectionDetails[index];
                console.log('attempt to save', myDetail);
                InspectionReportDetailModel.saveModel(myDetail).then(function(index) {
                    if (index < displayEdit.inspectionReport.inspectionDetails.length) {
                        saveListItem(index+1);
                    }
                });
                //displayEdit.inspectionReport.inspectionDetails[index] = myDetail._id;

            }

            saveListItem(0);

/*
            angular.forEach(displayEdit.inspectionReport.inspectionDetails, function (value,key) {
                console.log('attempt to save', value);
                InspectionReportDetailModel.saveModel(value);
                var index = displayEdit.inspectionReport.inspectionDetails.indexOf(value);
                displayEdit.inspectionReport.inspectionDetails[index] = value._id;
                //displayEdit.inspectionReport.inspectionDetails.push(value._id);
            });
            */

            //console.log('about to submit, inspectionReport.inspectionDetails is', displayEdit.inspectionReport.inspectionDetails);

            InspectionReportModel.saveModel(displayEdit.inspectionReport).then( function(res) {
                $state.go('inspectionReport.view', { inspectionReportId: res._id});
            });
        };

        displayEdit.cancel = function() {
            if (displayEdit.mode === "add") {
                $state.go('inspectionReport.list');
            } else {
                $state.go('inspectionReport.view', {inspectionReportId: displayEdit.inspectionReport._id});
            }
        };

        displayEdit.remove = function() {
            if (confirm('Are you sure you want to delete this inspectionReport?')) {
                InspectionReportModel.delete(displayEdit.inspectionReportId).then(
                    function (res) {
                        $state.go('inspectionReport.list');
                    }
                );
            }
        };

        displayEdit.addDetail = function() {
            InspectionReportDetailModel.getNew().then(
                function(res) {
                    displayEdit.inspectionReport.inspectionDetails.push(res);

                    $scope.$apply();
                }
            );
        };

        displayEdit.removeDetail = function(detail) {
            // Add this to a list of details to delete from the DB on submit...
            //displayEdit.detailsToDelete.push(detail._id);

            // Remove it from the list we're displaying
            var index;
            //index = displayEdit.details.indexOf(detail);
            //displayEdit.details.splice(index, 1);

            // Remove it from the array in our inspectionReport object
            index = displayEdit.inspectionReport.inspectionDetails.indexOf(detail._id);
            displayEdit.inspectionReport.inspectionDetails.splice(index,1);

        };

    }
]);
