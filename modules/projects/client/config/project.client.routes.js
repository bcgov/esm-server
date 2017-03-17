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
				}
			},
			controller: function ($rootScope, $scope, $location, $stateParams, $state, project) {
				$scope.project = project;
				$scope.tabs = [
					{ heading: "Mine Summary", route:"project.overview", active:false, page:'DETAILS' },
					{ heading: "Authorizations", route:"project.authorizations", active:false, page:'AUTHORIZATION' },
					{ heading: "Compliance Oversight", route:"project.compliance", active:false, page:'COMPLIANCE' },
					{ heading: "Other Documents", route:"project.docs", active:false, page:'DOCS' }
				];

				// Static map generation
				// Force this false when we enter
				$rootScope.isMapActive = false;
				var lat = $scope.project.latitude, lng = $scope.project.longitude;
				console.log("scope.project.latitude:", lat);
				console.log("scope.project.longitude:", lng);
				var apiKey = "AIzaSyCFL10NqreZxmQKTr_uBLxcars5-0b83nA";
				var map ='';
				map += "https://maps.googleapis.com/maps/api/staticmap?center=" + lat + "," + lng;
				map += "&markers=color:red%7Clabel:";
				//$scope.project.staticMap += $scope.project.commodityType === "Metal" ? "M" : "C";
				map += "%7C" + lat + "," + lng;
				map += "&zoom=4&size=320x180&maptype=map&key=" + apiKey;
				$scope.project.staticMap = map;

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

				function pageLinks(page) {
					$scope.links = _.filter($scope.project.externalLinks, function (link) {
						return link.type === 'EXTERNAL_LINK' && link.page === page;
					});
				}

				// when state changes update the tab's active state and reload the external links
				$scope.$on("$stateChangeSuccess", function() {
					var activeTab;
					$scope.tabs.forEach(function(tab) {
						tab.active =  $state.current.name === tab.route;
						activeTab = tab.active ? tab : activeTab;
					});
					if (activeTab) {
						pageLinks(activeTab.page);
					}
				});

				// If user has navigated here from the mine list then transition to the overview tab
				if ($state.current.name === 'project') {
					$state.transitionTo('project.overview',	{projectid: $scope.project.code}, {reload: false, inherit: false, notify: true});
				}
			}
		})
		.state('project.overview', {
			url: '/overview',
			templateUrl: 'modules/projects/client/views/partials/overview.html'
		})
		.state('project.authorizations', {
			url: '/authorizations',
			templateUrl: 'modules/projects/client/views/partials/authorizations.html'
		})
		.state('project.compliance', {
			url: '/compliance',
			templateUrl: 'modules/projects/client/views/partials/compliance.html'
		})
		.state('project.docs', {
			url: '/docs',
			templateUrl: 'modules/projects/client/views/partials/otherDocs.html',
			controllerAs: 'vm',
			resolve: {
				otherDocuments: function($stateParams, project, OtherDocumentModel) {
					return OtherDocumentModel.forProjectCode(project.code);
				}
			},
			controller: function ($rootScope, $scope, $stateParams, $state, project, otherDocuments) {
				var vm = this;
				vm.project = project;
				vm.otherDocuments = otherDocuments;
				vm.asString = otherDocuments.length;
			}
		})
		;
	}]);

