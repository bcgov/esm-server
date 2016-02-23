'use strict';

angular.module('core')
	.directive('tmplInspectionReportDisplayEdit', directiveInspectionReportDisplayEdit)
	//.directive('tmplInspectionReportUsersByOrg', directiveInspectionReportUsersByOrg)
;
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveInspectionReportDisplayEdit.$inject = [];
/* @ngInject */
function directiveInspectionReportDisplayEdit() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/inspectionReport/client/views/inspection-report-partials/inspection-report-display-edit-form.html',
		controller: 'controllerInspectionReportDisplayEdit',
		controllerAs: 'displayEdit',
		scope: {
			inspectionReport: '@',
			mode: '='
		}
	};
	return directive;
}
