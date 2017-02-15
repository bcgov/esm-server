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
	$scope.KMLLayers = [];

	$scope.toggleLayer = function (item) {
		console.log("toggleLayer:", item);
		item.show = !item.show;
	};

	// Map is active
	$rootScope.isMapActive = true;

	$scope.toggleMapActive = function(){
		$rootScope.isMapActive = false;
		window.history.back();
	};

	$scope.toggleMapHome = function() {
		$rootScope.isMapActive = false;
	};

	var lat = 54.726668;
	var lng = -127.647621;
	if ($stateParams.project) {
		lat = $stateParams.project.latitude;
		lng = $stateParams.project.longitude;
		// console.log("$scope.project", $stateParams.project);
		ProjectModel.byCode($stateParams.project.code)
		.then(function (p) {
			// Show the marker automatically
			$scope.map.window.model = p;
			$scope.map.window.show = true;
			$scope.map.window.options.pixelOffset = new window.google.maps.Size(0, -35, 'px', 'px');
			// TODO: Add layers when they arrive from biz.
			// $scope.KMLLayers.push(
			// 	{	url: "https://example.com/fetch",
			// 		label: "ADMIN",
			// 		preserveViewport: true,
			// 		show: false,
			// 		_id: 654654
			// 	});
			uiGmapIsReady.promise().then(function (maps) {
				var gMap = $scope.control.getGMap();
				gMap.setZoom(9);
				// TODO: Add layers when they arrive from biz.
				// var controlUI = angular.element('<div>Legend</div>');
				// controlUI.css('backgroundColor','#fff');
				// controlUI.css('border','2px solid #fff');
				// controlUI.css('borderRadius','3px');
				// controlUI.css('boxShadow','0 2px 6px rgba(0,0,0,.3)');
				// controlUI.css('cursor','pointer');
				// controlUI.css('marginBottom','22px');
				// controlUI.css('textAlign','center');
				// controlUI.css('z-index','9999');
				// controlUI.css('position','fixed');
				// controlUI.css('top','50px');
				// controlUI.css('right','50px');
				// controlUI.bind('click', function (e) {
					// For handling click on layer
				// 	console.log(e);
				// });
				// controlUI.innerHTML = 'Click to recenter the map';
				// angular.element.append(controlUI);
				// var body = angular.element(document.querySelector('#legend'));
				// body.append(controlUI)
			});
			return ProjectModel.all();
		}).then(function (ps) {
			$scope.projects = ps;
			$scope.$apply();
		});
	} else {
		ProjectModel.all()
		.then(function (p) {
			$scope.map.window.options.pixelOffset = new window.google.maps.Size(0, -35, 'px', 'px');
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
				$scope.map.window.model = model;
				$scope.map.window.show = true;
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
