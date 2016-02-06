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
directiveLoadActivityProcess.$inject = ['$compile'];
/* @ngInject */
function directiveLoadActivityProcess($compile) {
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
					var tmpl = '<tmpl-' + newActivity.processCode + ' x-anchor="' + (newActivity.code + '-' + newActivity._id) + '" x-activity="activity" x-project="project">';
					var ctmpl = $compile(tmpl)(scope);
					element.replaceWith(ctmpl);
				}
			});

		}
	};
	return directive;
}
