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
			controller: function ($scope, $stateParams, project, _) {
				$scope.project = project;
				$scope.links = project.externalLinks;

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
						var value = p.ownership.replace(/[\r\n]/g, ";");
						value = value.replace(/;/g, "<br>");
						return value;
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

