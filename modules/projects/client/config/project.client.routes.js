'use strict';

angular.module('project').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {

		$stateProvider
		// Project Page
		.state('project', {
			url: '/p/:projectid',
			templateUrl: 'modules/projects/client/views/mine.html',
			resolve: {
				project: function ($stateParams, ProjectModel) {
					return ProjectModel.byCode($stateParams.projectid);
				},
				otherDocuments: function($stateParams, project, OtherDocumentModel) {
					return OtherDocumentModel.forProjectCode(project.projectCode);
				}
			},
			controller: function ($rootScope, $scope, $stateParams, project, otherDocuments, _) {
				// Force this false when we enter
				$rootScope.isMapActive = false;
				$scope.project = project;
				$scope.otherDocuments = otherDocuments || [];
				$scope.links = project.externalLinks;
				console.log("scope.project.latitude:", $scope.project.latitude);
				console.log("scope.project.longitude:", $scope.project.longitude);
				var apiKey = "AIzaSyDrR25JJBP365DYGaT-y0pCd8_RZleJZG0";
				// Static map generation
				$scope.project.staticMap = "https://maps.googleapis.com/maps/api/staticmap?center=" + $scope.project.latitude + "," + $scope.project.longitude;
				$scope.project.staticMap += "&markers=color:red%7Clabel:";
				//$scope.project.staticMap += $scope.project.commodityType === "Metal" ? "M" : "C";
				$scope.project.staticMap += "%7C" + $scope.project.latitude + "," + $scope.project.longitude;
				$scope.project.staticMap += "&zoom=4&size=320x180&maptype=map&key=" + apiKey;

				$scope.content = function(p, type, page) {
					try {
						var content = _.find(p.content, function(o) { return o.type === type && o.page === page; });
						return content.html || content.text;
					} catch(e) {
						return '';
					}
				};

				$scope.ownership = function(p) {
					try {
						return p.ownership.replace(/;/g, "<br>");
					} catch(e) {
						return p.ownership;
					}
				};

				$scope.statusClass = function(act) {
					try {
						var value = act.status.toLowerCase();
						value = value.replace(/[/]/g, "");
						return value;
					} catch(e) {
						return '';
					}
				};

				$scope.page = function(page) {
					$scope.links = _.filter($scope.project.externalLinks, function(l) { return l.type === 'EXTERNAL_LINK' && l.page === page; } );
				};

				$scope.page('DETAILS');
			}
		})

		;
	}]);

