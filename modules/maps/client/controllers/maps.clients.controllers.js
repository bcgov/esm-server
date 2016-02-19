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
	
	mpl.pointCenter = '54.726668, -127.647621'; // middle of BC

	mpl.auth = Authentication;

	$scope.$watch('project', function (newValue) {
		if (newValue && newValue.lat && newValue.lon) {
			mpl.point = (newValue.lat + ',' + newValue.lon);
		} else {
			mpl.point = mpl.pointCenter;
		}
	});

	$scope.$watch('layers', function (newValue) {
		if (newValue) {
			mpl.layers[newValue.name] = newValue.layers;
		}
	});
}
