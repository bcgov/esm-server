'use strict';

angular.module ('vcs')

// -------------------------------------------------------------------------
//
// directive for listing vcs
//
// -------------------------------------------------------------------------
.directive ('tmplVcList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/vcs/client/views/vc-list.html',
		controller: 'controllerVcList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a vc
//
// -------------------------------------------------------------------------
.directive ('editVcModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			vc: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('editVcModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/vcs/client/views/vc-edit.html',
					controller   : 'controllerEditVcModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshVcList');
				}, function () {});
			});
		}
	};
}])

;
