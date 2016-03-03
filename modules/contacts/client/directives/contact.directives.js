'use strict';

angular.module ('contacts')

// -------------------------------------------------------------------------
//
// directive for listing contacts
//
// -------------------------------------------------------------------------
.directive ('tmplContactList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/contacts/client/views/contact-list.html',
		controller: 'controllerContactList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a contact
//
// -------------------------------------------------------------------------
.directive ('editContactModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			contact: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('contact modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/contacts/client/views/contact-edit.html',
					controller   : 'controllerEditContactModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshContactList');
				}, function () {});
			});
		}
	};
}])

;
