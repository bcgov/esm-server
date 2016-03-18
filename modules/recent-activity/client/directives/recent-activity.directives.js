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
		controller: function($scope, RecentActivityModel, ProjectModel) {
			$scope.recentActs = RecentActivityModel.getCollection();
			$scope.projectlookup = ProjectModel.lookup();
		}
	};
})

;