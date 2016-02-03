'use strict';

angular.module('organizations')
	// General
	.controller('controllerOrganizations', controllerOrganizations)
	// .controller('controllerOrganizationsFilterBar', controllerOrganizationsFilterBar)
	.controller('controllerOrganizationsList', controllerOrganizationsList)
	.controller('controllerOrganizationsIntake', controllerOrganizationsIntake);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Public Organizations Main
//
// -----------------------------------------------------------------------------------
controllerOrganizations.$inject = ['$state', 'Organizations', 'ORGANIZATION_TYPES', 'Authentication'];
/* @ngInject */
function controllerOrganizations($state, Organizations, ORGANIZATION_TYPES, Authentication) {
	var organizations = this;

	organizations.types = ORGANIZATION_TYPES;

	organizations.authentication = Authentication;

	Organizations.getOrganizations().then( function(res) {
		organizations.organizations = res.data;
	});
	
	// sorting
	organizations.panelSort = [
		{'field': 'name', 'name':'Name'},
		{'field': 'status', 'name':'Status'},	
		{'field': 'dateUpdated', 'name':'Date Updated'},
		{'field': 'dateCreate', 'name':'Date Created'}
	];
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Filter Bar
//
// -----------------------------------------------------------------------------------
// controllerOrganizationsFilterBar.$inject = ['$scope', '$state', 'Organizations', '$filter', 'ORGANIZATION_TYPES', 'Authentication'];
// /* @ngInject */
// function controllerOrganizationsFilterBar($scope, $state, Organizations, $filter, ORGANIZATION_TYPES, Authentication) {
// 	var fbc = this;

// 	fbc.types = ORGANIZATION_TYPES;

// 	fbc.filter = null;

// 	$scope.$watch('data', function(newValue) {
// 		if(newValue) {
// 			fbc.data = newValue;
// 		}
// 	});

// 	fbc.updateFilter = function() {
// 		if ( fbc.data.organizations) {
// 			fbc.data.organizations = $filter('organizations')(fbc.filter);
// 		}
// 	};

// }
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Organizations
//
// -----------------------------------------------------------------------------------
controllerOrganizationsList.$inject = ['$scope', '$state', 'Authentication', 'Organization'];
/* @ngInject */
function controllerOrganizationsList($scope, $state, Authentication, Organization) {
	var organizationList = this;
	
	$scope.$watch('organizations', function(newValue) {
		organizationList.organizations = newValue;
	});



	// when clicking on the schedule view, if there only one activity, just go there.
	organizationList.optimizedSelectOrganization = function(organizationId) {

		Organization.getOrganization({id: organizationId}).then(function(res) {
			if (res.data.activities.length !== 1) {
				$state.go('organization', {id:organizationId});
			} else {
				$state.go('activity', {id:res.data.activities[0]._id});
			}
		});	

	};


	organizationList.auth = Authentication;
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: Organizations Intake
//
// -----------------------------------------------------------------------------------
controllerOrganizationsIntake.$inject = ['$scope', '$state'];
/* @ngInject */
function controllerOrganizationsIntake($scope, $state) {
	var organizationIntakeList = this;

	$scope.$watch('organizations', function(newValue) {
		organizationIntakeList.organizations = newValue;
	});

	organizationIntakeList.goToOrganization = function(organizationId) {
		$state.go('eao.organization', {id:organizationId});
	};
	
}
