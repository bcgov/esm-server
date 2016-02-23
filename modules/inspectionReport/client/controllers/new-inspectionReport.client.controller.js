'use strict';

angular.module('inspectionReport').controller('NewInspectionReportController', ['$scope', '$filter', '$state',
    function ($scope, $filter, $state) {
        var addInspectionReport = this;
        addInspectionReport.options = {
            mode: 'add'
        };
    }
]);
