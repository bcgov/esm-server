'use strict';

angular.module('project')
	.filter('phaseName', filterPhaseName);
   
// -----------------------------------------------------------------------------------
//
// FILTER: Phase Name from ID
//
// -----------------------------------------------------------------------------------
filterPhaseName.$inject = ['_'];
/* @ngInject */
function filterPhaseName(_) {
	return function(input, phases) {
		return _(phases).filter(function(phase) { return input === phase._id; }).pluck('name').value()[0];
	};
}
