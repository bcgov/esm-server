'use strict';

angular.module('activity')
	.directive('tmplActivity', directiveActivity)
	.directive('tmplLoadActivityProcess', directiveLoadActivityProcess);	
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity
//
// -----------------------------------------------------------------------------------
directiveActivity.$inject = [];
/* @ngInject */
function directiveActivity() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/activities/client/views/activity.html',
		controller: 'controllerActivity',
		controllerAs: 'actBase'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Load process code
//
// -----------------------------------------------------------------------------------
directiveLoadActivityProcess.$inject = ['$compile', '$filter'];
/* @ngInject */
function directiveLoadActivityProcess($compile, $filter) {
	var directive = {
		restrict: 'E',
		scope: {
			activity: '=',
			project: '='
		},
		link: function link(scope, element, attrs) {
			// each directive receives: 
			// anchor: the key used to identify the item / panel type to cross reference the process data.
			// itemId: the id used to get more info about the item via a service.

			scope.$watch('activity', function(newActivity) {
				if (newActivity) {
					var tmpl = '<tmpl-process-' + $filter('kebab')(newActivity.processCode) + ' x-anchor="' + (newActivity.code + '-' + newActivity._id) + '" x-activity="activity" x-project="project"></tmpl-process-' + $filter('kebab')(newActivity.processCode) + '>';
					var ctmpl = $compile(tmpl)(scope);
					element.replaceWith(ctmpl);
				}
			});

		}
	};
	return directive;
}
