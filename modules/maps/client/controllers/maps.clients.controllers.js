'use strict';

angular.module('maps')
	.controller('controllerMap', controllerMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Maps
//
// -----------------------------------------------------------------------------------
controllerMap.$inject = ['$rootScope', 'uiGmapIsReady', '$scope', 'Authentication', 'uiGmapGoogleMapApi', '$filter', '_', 'Document', 'ProjectModel', '$stateParams'];
/* @ngInject */
function controllerMap($rootScope, uiGmapIsReady, $scope, Authentication, uiGmapGoogleMapApi, $filter, _, Document, ProjectModel, $stateParams) {
	var projectList = this;
	$scope.control = {};

	// Map is active
	$rootScope.isMapActive = true;

	$scope.blah = function(){
		$rootScope.isMapActive = false;
		window.history.back();
	};


	var lat = 54.726668;
	var lng = -127.647621;
	if ($stateParams.project) {
		lat = $stateParams.project.latitude;
		lng = $stateParams.project.longitude;
		// console.log("$scope.project", $stateParams.project);
		ProjectModel.byCode($stateParams.project.code)
		.then(function (p) {
			console.log("project:", p);
			$scope.projects = [];
			$scope.projects.push(p);
			uiGmapIsReady.promise().then(function (maps) {
				var gMap = $scope.control.getGMap();
				gMap.setZoom(9);
			});
			$scope.$apply();
		});
	} else {
		ProjectModel.all()
		.then(function (p) {
			// console.log("projects:", p);
			$scope.projects = p;
			$scope.$apply();
		});
	}

	$scope.map = {
		center: {
			latitude: lat,
			longitude: lng
		},
		zoom: 6,
		options: {
			scrollwheel: true,
			minZoom: 4
		},
		markers: $scope.projects, // array of models to display
		markersEvents: {
			click: function(marker, eventName, model) {
				// Is there an open comment period?
				// CommentPeriodModel.forProject(model._id)
				// .then( function (periods) {
				// 	var isOpen = false;
				// 	_.each(periods, function (period) {
				// 		var today 	= new Date ();
				// 		var start 	= new Date (period.dateStarted);
				// 		var end 	= new Date (period.dateCompleted);
				// 		var open 	= start < today && today < end;
				// 		if (open) {
				// 			model.isOpen = true;
				// 			model.period = period;
				// 		}
				// 	});
				// });
				projectList.map.window.model = model;
				projectList.map.window.show = true;
			}
		},
		window: {
			marker: {},
			show: false,
			closeClick: function() {
				this.show = false;
			},
			options: {
				// offset to fit the custom icon
					// pixelOffset: new maps.Size(0, -35, 'px', 'px')
			} // define when map is ready
		},
		clusterOptions: {
			calculator : function(markers, numStyles) {
				var changeAt = 500;
				var index = 0;
				var count = markers.length;
				var dv = count;
				while (dv !== 0) {
					dv = parseInt(dv / changeAt, 10);
					index++;
				}
				index = Math.min(index, numStyles);
				return {
					text: count,
					index: index
				};
			}
		}
	};

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			// console.log("newval:", newValue);
			projectList.projects = newValue;
		}
	});
}
