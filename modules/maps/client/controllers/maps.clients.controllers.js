'use strict';

angular.module('maps')
	.controller('controllerMap', controllerMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Maps
//
// -----------------------------------------------------------------------------------
controllerMap.$inject = ['$scope', 'Authentication', 'uiGmapGoogleMapApi', '$filter', '_', 'Document', 'ProjectModel'];
/* @ngInject */
function controllerMap($scope, Authentication, uiGmapGoogleMapApi, $filter, _, Document, ProjectModel) {
	var projectList = this;
	ProjectModel.all()
	.then(function (p) {
		console.log("projects:", p);
		$scope.projects = p;
		$scope.map = {
			center: {
				latitude: 54.726668,
				longitude: -127.647621
			},
			zoom: 5,
			options: {
				scrollwheel: false,
				minZoom: 4
			},
			markers: p, // array of models to display
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

		$scope.$apply();
	});

	$scope.$watch('projects', function(newValue) {
		if (newValue) {
			projectList.projects = newValue;
		}
	});
}
