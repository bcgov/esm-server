'use strict';

angular.module('users')
	.directive('userSearchChooser', function ($filter, $modal, NgTableParams, GroupModel, UserModel, _) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				destination: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/users/client/views/user-search-chooser.html',
						size: 'lg',
						resolve: {
							projectGroups: function () {
								return GroupModel.forProject(scope.project._id);
							}
						},
						controllerAs: 's',
						controller: function ($filter,$scope, $modalInstance, projectGroups) {
							var s = this;

							var isArray = _.isArray(scope.destination);

							s.groups = [];
							_.forEach(projectGroups, function (o) {
								var item = _.find(s.groups, function (g) {
									return g.id === o.groupId;
								});
								if (!item) {
									s.groups.push({id: o.groupId, title: o.groupName});
								}
							});
							s.groups.push({id: '', title: ''});

							s.searching = false;

							// search params...
							s.name = undefined;
							s.email = undefined;
							s.org = undefined;
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

						}
					}).result.then(function (data) {
						if (_.isArray(scope.destination)) {
							scope.destination = data;
						} else {
							scope.destination = data[0];
						}
					})
						.catch(function (err) {
						});
				});
			}
		};
	})
;
