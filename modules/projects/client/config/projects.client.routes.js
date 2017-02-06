'use strict';

angular.module('projects').config (
	['$locationProvider', '$stateProvider', '$urlRouterProvider', '_',
	function ($locationProvider, $stateProvider, $urlRouterProvider, _) {
		$stateProvider

		// Project List Page (Mine List)
		.state('projects', {
			url: '/find-mines-in-british-columbia',
			templateUrl: 'modules/projects/client/views/mines.list.html',
			data: {
				roles: ['admin']
			},
			resolve: {
				projects: function ($stateParams, ProjectModel) {
					// if we need to filter, use ProjectModel.query({blah});
					return ProjectModel.all();
				}
			},
			controller: function (Utils, $scope, $stateParams, projects, Authentication, Application, _) {
				$scope.projects = projects; // unsorted list...
				$scope.sortedList = projects;

				$scope.authentication = Authentication;
				$scope.Application = Application;
				$scope.filterObj = {};

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

				$scope.sorting = {
					column: 'name',
					ascending: true
				};

				$scope.sortBy = function(column) {
					//is this the current column?
					if ($scope.sorting.column.toLowerCase() === column.toLowerCase()){
						//so we reverse the order...
						$scope.sorting.ascending = !$scope.sorting.ascending;
					} else {
						// changing column, set to ascending...
						$scope.sorting.column = column.toLowerCase();
						$scope.sorting.ascending = true;
					}
					$scope.applySort();
				};

				$scope.applySort = function() {
					// sort ascending first...
					$scope.sortedList = _.sortBy($scope.projects, function(p) {

						if ($scope.sorting.column === 'name') {
							return _.isEmpty(p.name) ? null : p.name.toLowerCase();
						} else if ($scope.sorting.column === 'operator') {
							return _.isEmpty(p.operator) ? null : p.operator.toLowerCase();
						} else if ($scope.sorting.column === 'commodity') {
							return _.isEmpty(p.commodityType) ? null : p.commodityType.toLowerCase();
						}
						// by name if none specified... or we incorrectly identified...
						return _.isEmpty(p.name) ? null : p.name.toLowerCase();
					});

					if (!$scope.sorting.ascending) {
						// and if we are not supposed to be ascending... then reverse it!
						$scope.sortedList = _($scope.sortedList).reverse().value();
					}
				};

				$scope.applySort();
			}
		});
	}]);
