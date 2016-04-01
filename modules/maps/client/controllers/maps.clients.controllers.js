'use strict';

angular.module('maps')
    .controller('controllerMap', controllerMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Maps
//
// -----------------------------------------------------------------------------------
controllerMap.$inject = ['$scope', 'Authentication', 'uiGmapGoogleMapApi', '$filter'];
/* @ngInject */
function controllerMap($scope, Authentication, uiGmapGoogleMapApi, $filter) {
	var mpl = this;
	mpl.project = [];
	mpl.layers = {};

	// The "then" callback function provides the google.maps object.
	uiGmapGoogleMapApi.then(function(maps) {
		mpl.map = {
			center: {
				latitude: mpl.project[0].lat,
				longitude: mpl.project[0].lon
			},
			zoom: 5,
			options: {
				scrollwheel: false,
				minZoom: 4
			},
			markers: mpl.projectFiltered // array of models to display
		};
	});

	$scope.$watch('showPoint', function(newValue){
		if (newValue) {
			mpl.projectFiltered = [mpl.project];
		} else {
			mpl.projectFiltered = [];
		}
	});

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			newValue.latitude = newValue.lat;
			newValue.longitude = newValue.lon;

			mpl.project = [newValue];

			$scope.showPoint = true;
		}
	});
}