'use strict';

angular.module ('features')

// -------------------------------------------------------------------------
//
// directive for listing features
//
// -------------------------------------------------------------------------
.directive ('tmplFeatureList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/features/client/views/feature-list.html',
		controller: 'controllerFeatureList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a feature
//
// -------------------------------------------------------------------------
.directive ('editFeatureModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			project: '=',
			feature: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('feature modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/features/client/views/feature-edit.html',
					controller   : 'controllerEditFeatureModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshFeatureList');
				}, function () {});
			});
		}
	};
}])

;
