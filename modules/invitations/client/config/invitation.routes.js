'use strict';
// =========================================================================
//
// roles routes
//
// =========================================================================
angular.module('invitation').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
	// -------------------------------------------------------------------------
	//
	// this is the abstract, top level view for project roles.
	//
	// -------------------------------------------------------------------------
	.state('p.invitations', {
		url: '/invitations',
		templateUrl: 'modules/invitations/client/views/invitation.html',
		resolve: {
		},
		controller: function($scope, project, _, InvitationModel) {
			$scope.project = project;
			// callback when assigning users to roles
			// called by to the modal select users directive in utils
			// provided as an attribute on the form.
			$scope.blah = function(users, parent) {
				var userIds = _.map(users, function(user) {
					return user._id;
				});
				if (userIds) {
					// blah
				}
			};
		},
		onEnter: function (MenuControl, project) {
			MenuControl.routeAccessBuilder (undefined, project.code, '*', ['eao:admin', 'responsible-epd','project-admin', 'project-lead','project-intake', 'pro:admin', 'pro:member']);
		}
	})

	;

}]);
