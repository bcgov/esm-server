'use strict';

angular.module ('projectconditions')

// -------------------------------------------------------------------------
//
// directive for listing projectconditions
//
// -------------------------------------------------------------------------
.directive ('tmplProjectConditionList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/projectconditions/client/views/projectcondition-list.html',
		controller: 'controllerProjectConditionList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a projectcondition
//
// -------------------------------------------------------------------------
.directive ('editProjectConditionModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			projectcondition: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('projectcondition modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/projectconditions/client/views/projectcondition-edit.html',
					controller   : 'controllerEditProjectConditionModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshProjectConditionList');
				}, function () {});
			});
		}
	};
}])

;
