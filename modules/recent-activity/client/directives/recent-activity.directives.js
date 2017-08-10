'use strict';

angular.module ('recent-activity')

// -------------------------------------------------------------------------
//
// directive for listing orders
//
// -------------------------------------------------------------------------
.directive('tmplRecentActivity', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/recent-activity/client/views/recent-activity.html',
		scope: {
			form: '='
		},
		controller: function($scope, $state, RecentActivityModel, ProjectModel) {
			RecentActivityModel.getRecentActivityActive().then( function(res) {
				$scope.recentActs = res;
			});
			ProjectModel.lookup().then( function(res) {
				$scope.projectlookup = res;
			});
			this.onNewsClick = function(activity, event) {
				if (!activity.project) {
					event.preventDefault();
				} else {
					$state.go('p.detail', {projectid: $scope.projectlookup[activity.project].code });
				}
			};
		},
		controllerAs: 's'
	};
})
.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return val !== null ? parseInt(val, 10) : null;
      });
      ngModel.$formatters.push(function(val) {
        return val !== null ? '' + val : null;
      });
    }
  };
});

