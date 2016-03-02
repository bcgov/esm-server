'use strict';

angular.module ('conditions')

// -------------------------------------------------------------------------
//
// directive for listing conditions
//
// -------------------------------------------------------------------------
.directive ('tmplConditionList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/conditions/client/views/condition-list.html',
		controller: 'controllerConditionList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a condition
//
// -------------------------------------------------------------------------
.directive ('editConditionModal', ['$modal', function ($modal) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			condition: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('condition modal is running');
			element.on ('click', function () {
				console.log ("condition = ",scope.condition);
				console.log ("collection = ",scope.collection);
				console.log ("mode = ",scope.mode);
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/conditions/client/views/condition-edit.html',
					controller   : 'controllerEditConditionModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					console.log ('this was returned:', model);

					// if (scope.mode === 'edit') scope.condition = model;
					if (scope.mode === 'add') scope.collection.push (model);
				}, function () {});
			});
		}
	};
}])

;
