'use strict';

angular.module ('projectdescriptions')

// -------------------------------------------------------------------------
//
// directive for listing projectdescriptions
//
// -------------------------------------------------------------------------
.directive ('tmplProjectDescriptionList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/projectdescriptions/client/views/projectdescription-list.html',
		controller: 'controllerProjectDescriptionList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a projectdescription
//
// -------------------------------------------------------------------------
.directive ('editProjectDescriptionModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			projectdescription: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('projectdescription modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/projectdescriptions/client/views/projectdescription-edit.html',
					controller   : 'controllerEditProjectDescriptionModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshProjectDescriptionList');
				}, function () {});
			});
		}
	};
}])

;
