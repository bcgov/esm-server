angular.module('core')
    .filter('userHasRole', filterUserHasRole);

// -----------------------------------------------------------------------------------
//
// FILTER: Contains - Retuns true or false if string is in.
//
// -----------------------------------------------------------------------------------
filterUserHasRole.$inject = ['_', 'Authentication'];
/* @ngInject */
function filterUserHasRole(_, Authentication) {
	return function(term) {
		console.log(term, 'user has');
		if (Authentication) {
			return (_.indexOf(Authentication.roles, term) > -1);
		} else {
			return false;
		}
	};
}
