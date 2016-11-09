'use strict';
// =========================================================================
//
// prototype routes (under admin)
//
// =========================================================================
angular.module('prototype').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for orgs.
	// we resolve prototype to all sub-states
	//
	// -------------------------------------------------------------------------
	.state('admin.prototype', {
		data: {permissions: ['managePermissions']},
		abstract:true,
		url: '/prototype',
		template: '<ui-view></ui-view>',
		resolve: {
		}
	})
	// -------------------------------------------------------------------------
	//
	// the list state for prototype. orgs are guaranteed to
	// already be resolved
	//
	// -------------------------------------------------------------------------
	.state('admin.prototype.list', {
		url: '/list',
		templateUrl: 'modules/prototype/client/views/prototype-list.html',
		controller: function ($scope, NgTableParams, Application, Authentication, PrototypeModel) {
			$scope.authentication = Authentication;
			$scope.application = Application;
			$scope.data = PrototypeModel.getData();
			console.log("data:", $scope.data);
		},
	})

	;
}]);