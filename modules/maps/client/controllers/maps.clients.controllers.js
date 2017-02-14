'use strict';

angular.module('maps')
	.controller('controllerMap', controllerMap);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Maps
//
// -----------------------------------------------------------------------------------
controllerMap.$inject = ['$scope', 'Authentication', 'uiGmapGoogleMapApi', '$filter', '_', 'ArtifactModel', 'Document'];
/* @ngInject */
function controllerMap($scope, Authentication, uiGmapGoogleMapApi, $filter, _, ArtifactModel, Document) {
	var mpl = this;
	$scope.showPoint = false;

	// Just in case something goes sideways.
	if ($scope.project) {
		mpl.center = {latitude: $scope.project.lat, longitude: $scope.project.lon};
	} else {
		mpl.center = {latitude: 54.726668, longitude: -127.647621};
	}
	mpl.layers = {};
	mpl.markers = [];
	mpl.KMLLayers = [];

	mpl.map = {
		center: mpl.center,
		zoom: 5,
		options: {
			scrollwheel: false,
			minZoom: 4
		},
		markers: mpl.projectFiltered // array of models to display
	};

	$scope.$watch('showPoint', function(newValue){
		if (newValue) {
			mpl.projectFiltered = mpl.markers;
		} else {
			mpl.projectFiltered = [];
		}
	});

	$scope.$watch('project', function(newValue) {
		if (newValue) {
			mpl.map.center = {
				latitude: newValue.lat,
				longitude: newValue.lon
			};

			mpl.markers.push({
				id: newValue._id,
				latitude: newValue.lat,
				longitude: newValue.lon
			});

			// Go through the project's artifacts, and run through all their
			// main documents and supporting documents.  If a KML is detected,
			// show it.  This should behave as per what the user can/can't see
			// with respect to their Artifact/Document privileges.
			ArtifactModel.forProject(newValue._id)
			.then( function(res) {
				_.each(res, function (artifact) {
					ArtifactModel.lookup(artifact._id)
					.then (function (art) {
						// Go through Main Document
						if (art.document && art.document.internalExt === 'kml') {
							var mainDocument = art.document;
							// console.log("pushing main:", art.document);
							mpl.KMLLayers.push({
								url: window.location.protocol + "//" + window.location.host + "/api/document/" + mainDocument._id + "/fetch",
								label: mainDocument.internalOriginalName,
								show: true,
								_id: mainDocument._id
							});
						}
						// Go through supporting documents
						_.each(art.supportingDocuments, function (supporting) {
							Document.getDocument(supporting)
							.then( function (res) {
								// ML: This is silly.  When documents convert to the proper DBModel,
								// this needs to change.
								var doc = res;
								if (doc && doc.internalExt === 'kml') {
									// console.log("pushing supporting doc:", doc);
									mpl.KMLLayers.push({
										url: window.location.protocol + "//" + window.location.host + "/api/document/" + doc._id + "/fetch",
										label: doc.internalOriginalName,
										show: true,
										_id: doc._id
									});
								}
							});
						});
					});
				});
			});
			$scope.showPoint = true;
		}
	});
}
