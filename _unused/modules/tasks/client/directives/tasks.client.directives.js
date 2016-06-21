'use strict';

angular.module('tasks')
	.directive('tmplLoadTask', directiveLoadTask);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: expand panel
//
// -----------------------------------------------------------------------------------
directiveLoadTask.$inject = ['$compile'];
/* @ngInject */
function directiveLoadTask($compile) {
	var directive = {
		restrict: 'E',
		scope: {
			task: '=',
			project: '=',
			current: '='
		},
		link: function link(scope, element, attrs) {
			// each directive receives: 
			// anchor: the key used to identify the item / panel type to cross reference the process data.
			// itemId: the id used to get more info about the item via a service.

			scope.$watch('task', function(newTask) {
				if (newTask) {
					var tmpl = '<tmpl-' + newTask.processCode + ' x-anchor="' + (newTask.code + '-' + newTask._id) + '" x-task="task" x-project="project" ng-show="current === \'' + (newTask.code + '-' + newTask._id) + '\'"></tmpl-' + newTask.processCode + '>';
					var ctmpl = $compile(tmpl)(scope);
					element.replaceWith(ctmpl);
				}
			});

		}
	};
	return directive;
}
