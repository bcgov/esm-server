'use strict';

angular.module('organizations')
	.directive('lowercase', directiveLowercase)
	.directive('modalOrganizationList', directiveModalOrganizationList);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Parser to lowercase
//
// -----------------------------------------------------------------------------------
directiveLowercase.$inject = [];
/* @ngInject */
function directiveLowercase() {

	var directive = {
		require: 'ngModel',
		link: function (scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (input) {
				return input ? input.toLowerCase() : '';
			});
			element.css('text-transform', 'lowercase');
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Select Items
//
// -----------------------------------------------------------------------------------
directiveModalOrganizationList.$inject = ['$modal'];
/* @ngInject */
function directiveModalOrganizationList($modal) {
    var directive = {
       	restrict:'A',
       	scope : {
        		organizations: '=',
        		callback: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalOrganizationList = $modal.open({
					animation: true,
					templateUrl: 'modules/organizations/client/views/organizations-partials/modal-organization-list.html',
					controller: 'controllerModalOrganizationList',
					controllerAs: 'organizationList',
					resolve: {
						rOrganizations: function () { // all possible options
							return scope.organizations;
						}
					},
					size: 'lg'
				});
				modalOrganizationList.result.then(function (newItems) {
					// fire callback to assign the new selections
					// or just assign
					if (scope.callback) {
						scope.callback(newItems, scope.organizations);
					} else {
						scope.organizations = angular.copy(newItems);
					}
				}, function () {});
			});
		}
    };
    return directive;
}
