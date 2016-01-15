'use strict';

angular.module('project')
	.directive('tmplPublicProject', directivePublicProject)
	.directive('modalAddPublicComment', directiveModalAddPublicComment);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Main
//
// -----------------------------------------------------------------------------------
directivePublicProject.$inject = [];
/* @ngInject */
function directivePublicProject() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/projects/client/views/project-public.html',
		controller: 'controllerPublicProject',
		controllerAs: 'vm'
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal add public comment
//
// -----------------------------------------------------------------------------------
directiveModalAddPublicComment.$inject = ['$modal'];
/* @ngInject */
function directiveModalAddPublicComment($modal) {
	var directive = {
		restrict:'A',
		scope: {
			project: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalAddComment = $modal.open({
					animation: true,
					templateUrl: 'modules/projects/client/views/project-partials/modal-add-public-comment.html',
					controller: 'controllerModalAddComment',
					controllerAs: 'publicComment',
					backdrop: 'static',
					keyboard: false,
					resolve: {
						rProject: function() { return scope.project; }
					},
					size: 'md'
				});
				modalAddComment.result.then(function () {}, function () {});
			});
		}
	};
	return directive;
}
