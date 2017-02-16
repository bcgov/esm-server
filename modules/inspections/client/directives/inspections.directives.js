"use strict";

angular.module('inspections')
	.controller('projectInspectionController', projectInspectionController)
	.directive('tmplProjectCompliance', directiveProjectComplianceOversight);

directiveProjectComplianceOversight.$inject = [];
/* @ngInject */
function directiveProjectComplianceOversight() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/inspections/client/views/project-inspections.html',
		scope: {
			project: "=project"
		},
		controller: projectInspectionController,
		controllerAs: 'complianceList'
	};
	return directive;
}

projectInspectionController.$inject = ['$scope', '_', 'InspectionsModel'];
/* @ngInject */
function projectInspectionController($scope, _, InspectionsModel) {
	// var complianceList = this;
	var project = $scope.project;
	var code = project.code;
	InspectionsModel.forProject(code)
	.then(function (data) {
		// complianceList.data = data;
		$scope.sortedList = data;
		$scope.applySort();
	});
	$scope.sorting = {
		column: 'inspectionDate',
		ascending: false
	};
	$scope.applySort = applySort;
	$scope.sortBy = sortBy;

	function sortBy(column) {
		//is this the current column?
		if ($scope.sorting.column === column) {
			//so we reverse the order...
			$scope.sorting.ascending = !$scope.sorting.ascending;
		} else {
			// changing column, set to ascending...
			$scope.sorting.ascending = true;
		}
		$scope.sorting.column = column;
		$scope.applySort();
	}

	function applySort() {
		// sort ascending first...
		$scope.sortedList = _.sortBy($scope.sortedList, function(p) {
			if ($scope.sorting.column === 'inspectionName') {
				return _.isEmpty(p.inspectionName) ? null : p.inspectionName;
			} else if ($scope.sorting.column === 'inspectionDate') {
				return _.isEmpty(p.inspectionDate) ? null : new Date(p.inspectionDate);
			}
		});

		if (!$scope.sorting.ascending) {
			// and if we are not supposed to be ascending... then reverse it!
			$scope.sortedList = _($scope.sortedList).reverse().value();
		}
	}
}
