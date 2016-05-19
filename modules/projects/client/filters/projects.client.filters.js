'use strict';

angular.module('project')
	.filter('phaseName', filterPhaseName)
	.filter('filterIDR', filterIDRFromString)
	.filter('publicDisplayDateName', filterPublicDisplayDateName);
   
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
// -----------------------------------------------------------------------------------
//
// FILTER: Display Date Category
//
// -----------------------------------------------------------------------------------
filterPublicDisplayDateName.$inject = ['_'];
/* @ngInject */
function filterPublicDisplayDateName(_) {
	return function(input) {
		console.log("input:",input);
		return (input.split('-'))[1];
	};
}
// -----------------------------------------------------------------------------------
//
// FILTER: Remove IDR's from string
//
// -----------------------------------------------------------------------------------
filterIDRFromString.$inject = [];
/* @ngInject */
function filterIDRFromString() {
	return function(input) {
		 return (!input) ? '' : input.replace(/Shelley/g, 'FOOEY');
	};
}

