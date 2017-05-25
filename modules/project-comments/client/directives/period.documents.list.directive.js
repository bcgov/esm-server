'use strict';
angular.module ('comment')
// -------------------------------------------------------------------------
//
// list of related documents for a comment period
//
// -------------------------------------------------------------------------
.directive ('tmplPeriodDocumentsList', function (_) {
	return {
		restrict: 'E',
		scope: {
			fileList : '=',
			canModify : "=",
			sorting  : '=?'  // optional
		},
		templateUrl : 'modules/project-comments/client/views/partials/period-documents-list.html',
		controllerAs: 'ctrl',
		controller: function ($scope, $element, $attrs, _, Authentication) {
			var ctrl       = this;
			ctrl.fileList = $scope.fileList;
			ctrl.canModify = $scope.canModify;

			ctrl.authentication = Authentication;
			// default sort is by name ascending...
			var defaultSorting = {
				column: 'name',
				ascending: true
			};

			ctrl.sorting = $scope.sorting || defaultSorting;

			ctrl.sortBy = function(column) {
				//is this the current column?
				if (ctrl.sorting.column.toLowerCase() === column.toLowerCase()){
					//so we reverse the order...
					ctrl.sorting.ascending = !ctrl.sorting.ascending;
				} else {
					// changing column, set to ascending...
					ctrl.sorting.column = column.toLowerCase();
					ctrl.sorting.ascending = true;
				}
				ctrl.applySort();
			};

			ctrl.applySort = function() {
				// sort ascending first...
				ctrl.sortedFiles = _.sortBy(ctrl.fileList, function (f) {
					// more making sure that the displayName is set...
					if (_.isEmpty(f.displayName)) {
						f.displayName = f.documentFileName || f.internalOriginalName;
					}

					if (ctrl.sorting.column === 'name') {
						return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
					} else if (ctrl.sorting.column === 'author') {
						return _.isEmpty(f.documentAuthor) ? null : f.documentAuthor.toLowerCase();
					} else if (ctrl.sorting.column === 'type') {
						return _.isEmpty(f.internalExt) ? null : f.internalExt.toLowerCase();
					} else if (ctrl.sorting.column === 'size') {
						return _.isEmpty(f.internalExt) ? 0 : f.internalSize;
					} else if (ctrl.sorting.column === 'date') {
						//date uploaded
						return _.isEmpty(f.dateUploaded) ? 0 : f.dateUploaded;
					} else if (ctrl.sorting.column === 'pub') {
						//is published...
						return !f.isPublished;
					}
					// by name if none specified... or we incorrectly identified...
					return _.isEmpty(f.displayName) ? null : f.displayName.toLowerCase();
				});

				if (!ctrl.sorting.ascending) {
					// and if we are not supposed to be ascending... then reverse it!
					ctrl.sortedFiles = _(ctrl.sortedFiles).reverse().value();
				}
			};

			ctrl.removeDocument = function(doc) {
				_.remove(ctrl.fileList, doc);
			};

			$scope.$watchCollection('fileList', function (newValue) {
				if (newValue) {
					ctrl.applySort();
				}
			});
		}
	};
});
