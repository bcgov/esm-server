'use strict';

angular.module ('projectdocuments')

// -------------------------------------------------------------------------
//
// directive for listing projectdocuments
//
// -------------------------------------------------------------------------
.directive ('tmplProjectDocumentList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/projectdocuments/client/views/projectdocument-list.html',
		controller: 'controllerProjectDocumentList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a projectdocument
//
// -------------------------------------------------------------------------
.directive ('editProjectDocumentModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			projectdocument: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('editProjectDocumentModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/projectdocuments/client/views/projectdocument-edit.html',
					controller   : 'controllerEditProjectDocumentModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshProjectDocumentList');
				}, function () {});
			});
		}
	};
}])

;
