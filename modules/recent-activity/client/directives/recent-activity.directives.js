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
		controller: function($scope, RecentActivityModel, ProjectModel) {
			RecentActivityModel.getRecentActivityActive().then( function(res) {
				$scope.recentActs = res;
			});
			ProjectModel.lookup().then( function(res) {
				$scope.projectlookup = res;
			});
		}
	};
})

;
