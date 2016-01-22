'use strict';

angular.module('maps')
    .controller('controllerMap', controllerMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Maps
//
// -----------------------------------------------------------------------------------
controllerMap.$inject = ['$scope', 'Authentication'];
/* @ngInject */
function controllerMap($scope, Authentication) {
	var mpl = this;
	
	mpl.layers = {};
	
	mpl.auth = Authentication;

	$scope.$watch('project', function (newValue) {
		if (newValue && newValue.lat && newValue.lon) {
			mpl.point = (newValue.lat + ',' + newValue.lon);
		}
	});

	$scope.$watch('layers', function (newValue) {
		if (newValue) {
			mpl.layers[newValue.name] = newValue.layers;
		}
	});
}
