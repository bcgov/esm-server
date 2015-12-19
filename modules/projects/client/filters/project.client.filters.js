'use strict';

angular.module('project')
	.filter('phaseName', filterPhaseName);
   
// -----------------------------------------------------------------------------------
//
// FILTER: Phase Name from ID
//
// -----------------------------------------------------------------------------------
filterPhaseName.$inject = [];
/* @ngInject */
function filterPhaseName() {
	return function(input, phases) {
		return _(phases).filter(function(phase) { return input === phase._id; }).pluck('name').value()[0];
	};
}
