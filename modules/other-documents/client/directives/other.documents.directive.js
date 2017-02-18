'use strict';
angular.module('otherdocuments')
	.controller('otherDocumentsSectionController', otherDocumentsSectionController)
	.directive('otherDocumentsSection', otherDocumentsSectionDirective)
	.controller('otherDocumentsListController', otherDocumentsListController)
	.directive('otherDocumentsList', otherDocumentsListDirective);

otherDocumentsListDirective.$inject = ['_'];
/* @ngInject */
function otherDocumentsListDirective(_) {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/other-documents/client/views/project-other-document.html',
		scope: {
			project: "=project"
		},
		controller: otherDocumentsListController,
		controllerAs: 'otherDocumentList'
	};
	return directive;
}

otherDocumentsListController.$inject = ['$scope', '_', 'OtherDocumentModel'];
/* @ngInject */
function otherDocumentsListController($scope, _, OtherDocumentModel) {
	var _this = this;
	var project = $scope.project;
	var code = project.code;
	console.log("Look for docs for ", code);
	OtherDocumentModel.forProjectCode(code)
		.then(function (data) {
			var sortedList = _.sortBy(data, function(doc) {
				return doc.heading;
			});
			// console.log("sortedList",sortedList);
			var headings = new Set();
			_.forEach(data, function(a) {
				headings.add(a.heading);
			});
			// console.log("headings",headings);
			var map = [];
			headings.forEach(function(h){
				console.log("in for each h", h);
				var set = _.filter(sortedList,function(d) {
					// console.log("filtering", h, d.heading);
					return d.heading === h;
				});
				if(_.size(set) > 0) {
					map.push({
						name: h,
						list: set
					});
				}
			});
			console.log("map",map);
			$scope.headings = map;
		});
}


otherDocumentsSectionDirective.$inject = ['_'];
/* @ngInject */
function otherDocumentsSectionDirective(_) {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/other-documents/client/views/project-other-documents-section.html',
		scope: {
			project: "=project",
			heading: "="
		},
		controller: otherDocumentsSectionController,
		controllerAs: 'otherDocumentList'
	};
	return directive;
}

otherDocumentsSectionController.$inject = ['$scope', '_', 'OtherDocumentModel'];
/* @ngInject */
function otherDocumentsSectionController($scope, _, OtherDocumentModel) {
	var _this = this;
	var project = $scope.project;
	var heading = $scope.heading;
	console.log("Other section", project.code, heading);
	// var otherDocs = $scope.list;
	// var code = project.code;
	// console.log("Other section", code, heading, otherDocs);
	// OtherDocumentModel.forProjectCode(code)
	// 	.then(function (data) {
	// 		// complianceList.data = data;
	// 		$scope.sortedList = data;
	// 		$scope.applySort();
	// 	});
	$scope.sorting = {
		column: 'heading',
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
			return p.heading;
		});

		if (!$scope.sorting.ascending) {
			// and if we are not supposed to be ascending... then reverse it!
			$scope.sortedList = _($scope.sortedList).reverse().value();
		}
	}
}




/*
controller: function ($scope, _) {
	$scope.sortedList = [];

	// default sort is by name ascending...
	$scope.sorting = {
		column: 'title',
		ascending: true
	};

	$scope.sortBy = function(column) {
		//is this the current column?
		if ($scope.sorting.column.toLowerCase() === column.toLowerCase()){
			//so we reverse the order...
			$scope.sorting.ascending = !$scope.sorting.ascending;
		} else {
			// changing column, set to ascending...
			$scope.sorting.column = column.toLowerCase();
			$scope.sorting.ascending = true;
		}
		$scope.applySort();
	};

	$scope.applySort = function() {
		// sort ascending first...
		$scope.sortedList = _.sortBy($scope.list, function (f) {
			// more making sure that the displayName is set...
			// make an agency string list...
			var agencyNames = _.transform(f.agencies, function(result, a) {
				result.push(a.name);
			}, []);
			_.extend(f, {agenciesDisplay: agencyNames.join(', ')});

			if ($scope.sorting.column === 'title') {
				return _.isEmpty(f.title) ? null : f.title.toLowerCase();
				//} else if ($scope.sorting.column === 'agency') {
				//	return _.isEmpty(f.agency) && _.isEmpty(f.agency.orgCode) ? null : f.agency.orgCode.toLowerCase();
			} else if ($scope.sorting.column === 'type') {
				return _.isEmpty(f.documentType) ? null : f.documentType.toLowerCase();
			} else if ($scope.sorting.column === 'date') {
				return _.isEmpty(f.date) ? 0 : f.date;
			}
			return _.isEmpty(f.title) ? null : f.title.toLowerCase();
		});

		if (!$scope.sorting.ascending) {
			// and if we are not supposed to be ascending... then reverse it!
			$scope.sortedList = _($scope.sortedList).reverse().value();
		}
	};
*/