'use strict';
// =========================================================================
//
// condition routes (under admin)
//
// =========================================================================
angular.module('publicComments').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for conditions.
	// we resolve conditions to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('eao.myproject.pcs', {
		data: {roles: ['admin','eao','user']},
		abstract:false,
		url: '/pcs',
		template: '<ui-view></ui-view>',
		resolve: {
			comments: function (project, Project) {
				// console.log ('project = ', project);
				return Project.getPublicCommentsPublished (project._id).then (function(r){return r.data;});
			}
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for conditions. conditions are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('eao.myproject.pcs.list', {
		url: '/list',
		templateUrl: 'modules/publicComments/client/views/listing/pc.list.html',
		controller: function ($scope, NgTableParams, project, comments) {
			// console.log ('project = ', project);
			// console.log ('comments = ', comments);
			$scope.project = project;
			$scope.comments = comments;
			$scope.toggleDateComment = [];
			$scope.tableParams = new NgTableParams ({count:10}, {dataset: comments});
			$scope.show_filter = true;
		}
	})
	;

}]);


