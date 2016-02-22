'use strict';

angular.module('inspectionReport').controller('editInspectionReportController', ['$scope', '$state',
    function ($scope, $state ) {
        var editInspectionReport = this;
        if ($state.params.inspectionReportId === "") {
            $state.go('inspectionReport.list');
        } else {
            editInspectionReport.inspectionReportId = $state.params.inspectionReportId;
        }

        editInspectionReport.options = {
            inspectionReportId: $state.params.inspectionReportId,
            mode: 'edit'
        };

    }
]);