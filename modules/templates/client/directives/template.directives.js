'use strict';

angular.module ('templates')

// -------------------------------------------------------------------------
//
// directive for listing templates
//
// -------------------------------------------------------------------------
.directive ('tmplTemplateList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/templates/client/views/template-list.html',
		controller: 'controllerTemplateList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a template
//
// -------------------------------------------------------------------------
.directive ('editTemplateModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			template: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('editTemplateModal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/templates/client/views/template-edit.html',
					controller   : 'controllerEditTemplateModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshTemplateList');
				}, function () {});
			});
		}
	};
}])

;
