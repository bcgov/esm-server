'use strict';

angular.module ('topics')

// -------------------------------------------------------------------------
//
// directive for listing topics
//
// -------------------------------------------------------------------------
.directive ('tmplTopicList', function () {
	return {
		restrict: 'E',
		templateUrl: 'modules/topics/client/views/topic-list.html',
		controller: 'controllerTopicList',
		controllerAs: 'data'
	};
})

// -------------------------------------------------------------------------
//
// directive for adding or editing a topic
//
// -------------------------------------------------------------------------
.directive ('editTopicModal', ['$modal','$rootScope', function ($modal, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			collection: '=',
			topic: '=',
			mode: '@'
		},
		link : function (scope, element, attrs) {
			console.log('topic modal is running');
			element.on ('click', function () {
				var modalView = $modal.open ({
					animation    : true,
					templateUrl  : 'modules/topics/client/views/topic-edit.html',
					controller   : 'controllerEditTopicModal',
					controllerAs : 'd',
					scope        : scope,
					size         : 'lg'
				});
				modalView.result.then (function (model) {
					$rootScope.$broadcast('refreshTopicList');
				}, function () {});
			});
		}
	};
}])

;
