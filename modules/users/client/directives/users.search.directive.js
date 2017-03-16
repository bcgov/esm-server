'use strict';

angular.module('users')

	.directive('ngEnter', function () { //a directive to 'enter key press' in elements with the "ng-enter" attribute

		return function (scope, element, attrs) {

			element.bind("keydown keypress", function (event) {
				if (event.which === 13) {
					scope.$apply(function () {
						scope.$eval(attrs.ngEnter);
					});

					event.preventDefault();
				}
			});
		};
	})

	.directive('userSearchChooser', function ($rootScope, $filter, $modal, NgTableParams, ProjectGroupModel, UserModel, _) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				destination: '=',
				orgid: '=',
				title: '=',
				singleselectmode: '=',
				searchmode: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/users/client/views/user-search-chooser.html',
						size: 'lg',
						resolve: {
							projectGroups: function () {
								if (scope.project && scope.project._id && scope.project._id !== 'application') {
									return ProjectGroupModel.forProject(scope.project._id)
									.then( function (proj) {
										return proj;
									}, function (err) {
										// This will happen on 'new' projects which haven't been saved nor
										// submitted.
										return [];
									});
								} else {
									return [];
								}
							}
						},
						controllerAs: 's',
						controller: function ($filter,$scope, $modalInstance, projectGroups) {
							var s = this;
							s.title = scope.title;
							$scope.singleselectmode = scope.singleselectmode;

							var isArray = _.isArray(scope.destination);

							s.groups = [];
							_.forEach(projectGroups, function (o) {
								s.groups.push({id: o._id, title: o.name});
							});
							s.groups.push({id: '', title: ''});

							s.searching = false;

							// search params...
							s.name = undefined;
							s.email = undefined;
							s.org = scope.orgid;
							s.groupId = undefined;

							$scope.userList = [];
							$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.userList});

							$scope.checkboxes = { 'checked': false, items: {} };

							// watch for check all checkbox
							$scope.$watch('checkboxes.checked', function(value) {
								angular.forEach($scope.userList, function(item) {
									if (angular.isDefined(item._id)) {
										$scope.checkboxes.items[item._id] = value;
									}
								});
							});

							// watch for data checkboxes
							$scope.$watch('checkboxes.items', function(values) {
								if (!$scope.userList) {
									return;
								}
								var checked = 0, unchecked = 0, total = $scope.userList.length;
								angular.forEach($scope.userList, function(item) {
									checked   +=  ($scope.checkboxes.items[item._id]) || 0;
									unchecked += (!$scope.checkboxes.items[item._id]) || 0;
								});
								if ((unchecked === 0) || (checked === 0)) {
									$scope.checkboxes.checked = (checked === total);
									if (total === 0) {
										$scope.checkboxes.checked = false;
									}
								}
								// grayed checkbox
								angular.element(document.getElementById("select_all")).prop("indeterminate", (checked !== 0 && unchecked !== 0));
							}, true);

							$scope.toggleItem = function (item) {
								if ($scope.singleselectmode) {
									// Deselect the other checkboxes.
									if ($scope.checkboxes.items[item._id]) {
										// Pop the others off it and set it only to 1.
										$scope.checkboxes.items = [];
										$scope.checkboxes.items[item._id] = true;
									}
								}
							};

							$scope.isChecked = function (item) {
								return ($scope.checkboxes.items[item._id]);
							};

							s.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							s.ok = function () {
								// gather up the selected ones...
								var selected = [];
								angular.forEach($scope.userList, function(item) {
									if ($scope.checkboxes.items[item._id])
										selected.push(item);
								});

								$modalInstance.close(selected);
							};

							s.search = function () {
								s.searching = true;
								$scope.userList = [];
								// We no longer want to filter already invited users.
								UserModel.search(s.name, s.email, s.org, s.groupId)
								.then(function (res) {
									$scope.userList = res;
									$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.userList});
									s.searching = false;
									$scope.$apply();
								}).catch(function (err) {
									s.searching = false;
								});
							};

							s.keyPressEvent = function(event) {

								if (event.keyCode === 13) {
									event.preventDefault();
									console.log("Invoke the FIND");
									this.search();
								}
							};

						}
					}).result.then(function (data) {
						var isFunction = typeof(scope.destination) === 'function';
						if(isFunction) {
							scope.destination(data);
						} else if (_.isArray(scope.destination)) {
							scope.destination = data;
						} else {
							scope.destination = data[0];
						}
						$rootScope.$broadcast('USER_SEARCH_CHOOSER_SELECTED', {users: data});
					})
					.catch(function (err) {
						console.log(err);
					});
				});
			}
		};
	})
;
