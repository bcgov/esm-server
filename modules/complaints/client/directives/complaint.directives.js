'use strict';

angular.module ('complaints')

// -------------------------------------------------------------------------
//
// directive for listing complaints
//
// -------------------------------------------------------------------------
.directive ('tmplComplaintList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/complaints/client/views/complaint-list.html',
		controller: 'controllerComplaintList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a complaint
//
// -------------------------------------------------------------------------
.directive ('editComplaintModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			complaint: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('complaint modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/complaints/client/views/complaint-edit.html',
					controller   : 'controllerEditComplaintModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshComplaintList');
				}, function () {});
			});
		}
	};
}])

;
