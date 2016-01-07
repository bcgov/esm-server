'use strict';

angular.module('users')
	.directive('lowercase', directiveLowercase)
	.directive('modalUserList', directiveModalUserList);
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
directiveModalUserList.$inject = ['$modal'];
/* @ngInject */
function directiveModalUserList($modal) {
    var directive = {
       	restrict:'A',
       	scope : {
        		users: '=',
        		callback: '='
		},
		link : function(scope, element, attrs) {
			element.on('click', function() {
				var modalSelectItems = $modal.open({
					animation: true,
					templateUrl: 'modules/users/client/views/partials/nodal-user-list.html',
					controller: 'controllerModalUserList',
					controllerAs: 'userList',
					resolve: {
						rUsers: function () { // all possible options
							return scope.users;
						}
					},
					size: 'lg'
				});
				modalSelectItems.result.then(function (newItems) {
					// fire callback to assign the new selections
					// or just assign
					if (scope.callback) {
						scope.callback(newItems, scope.users);
					} else {
						scope.users = angular.copy(newItems);
					}
				}, function () {});
			});
		}
    };
    return directive;
}