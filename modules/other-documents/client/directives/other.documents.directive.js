'use strict';
angular.module('otherdocuments')

	.directive('otherDocumentsList', ['_', function (_) {
		return {
			restrict: 'E',
			scope: {
				list: '='
			},
			templateUrl: 'modules/other-documents/client/views/list.html',
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

				$scope.applySort();

			},
			controllerAs: 'otherDocumentList'
		};
	}])

;
