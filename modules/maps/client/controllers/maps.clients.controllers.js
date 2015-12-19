'use strict';

angular.module('maps')
    .controller('controllerMap', controllerMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Maps
//
// -----------------------------------------------------------------------------------
controllerMap.$inject = ['$scope'];
/* @ngInject */
function controllerMap($scope) {
	var mpl = this;
	
	mpl.layers = {};
	
	$scope.$watch('layers', function (newValue) {
		if (newValue) {
			mpl.layers[newValue.name] = newValue.layers
		}
	});
}
