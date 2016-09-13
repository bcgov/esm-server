'use strict';

// Setting up route
angular.module('inspectionReport').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('inspectionReport', {
                abstract: true,
                url: '/inspection-report',
                template: '<div ui-view></div>',
                data: {}
            })        
            .state('inspectionReport.list', {
                url: '/list',
                templateUrl: 'modules/inspectionReport/client/views/list-inspection-reports.client.view.html',
                controller: 'InspectionReportListController',
                controllerAs: 'listInspectionReports'
            })
            .state('inspectionReport.new', {
                url: '/new',
                templateUrl: 'modules/inspectionReport/client/views/new-inspection-report.client.view.html',
                controller: 'NewInspectionReportController',
                controllerAs: 'addInspectionReport'
            })
            .state('inspectionReport.edit', {
                url: '/edit/',
                templateUrl: 'modules/inspectionReport/client/views/edit-inspection-report.client.view.html',
                controller: 'editInspectionReportController',
                controllerAs: 'editInspectionReport'
            })
            .state('inspectionReport.view', {
                url: '/view',
                templateUrl: 'modules/inspectionReport/client/views/view-inspection-report.client.view.html',
                controller: 'viewInspectionReportController',
                controllerAs: 'viewInspectionReport'
            });
    }
]);
