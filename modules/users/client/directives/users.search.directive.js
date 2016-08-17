'use strict';

angular.module ('users')
	.directive ('userSearchChooser', function ($modal, NgTableParams, UserModel, _) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				destination: '='
			},
			link : function(scope, element, attrs) {
				element.on('click', function () {
					$modal.open ({
						animation: true,
						templateUrl: 'modules/users/client/views/user-search-chooser.html',
						size: 'lg',
						resolve: { },
						controllerAs: 's',
						controller: function ($scope, $modalInstance) {
							var s = this;

							var isArray = _.isArray(scope.destination);

							s.items = [];
							s.selected = [];

							s.name = 'jason';
							s.email = '@gmail.com';
							s.org = 'EAO';
							s.groupId = undefined;

							$scope.tableParams = new NgTableParams ({count:10}, {dataset: s.items});

							s.isSelected = function(id) {
								var item =  _.find(s.selected, function(o) { return o._id === id; });
								return !_.isEmpty(item);
							};

							s.select = function(id) {
								var item =  _.find(s.selected, function(o) { return o._id === id; });
								if (item) {
									_.remove(s.selected, function(o) { return o._id === id; });
								} else {
									var existingItem = _.find(s.items, function(o) { return o._id === id; });
									if (!_.isEmpty(existingItem)) {
										if (isArray) {
											s.selected.push(existingItem);
										} else {
											s.selected = [existingItem];
										}
									}
								}
							};

							s.cancel = function () { $modalInstance.dismiss ('cancel'); };

							s.ok = function () {
								$modalInstance.close (s.selected);
							};

							s.search = function() {
								s.items = [];
								UserModel.search(s.name, s.email, s.org, s.groupId)
									.then(function(res) {
										s.items = res;
										$scope.tableParams = new NgTableParams ({count:10}, {dataset: s.items});
									});
							};

						}
					}).result.then (function (data) {
						if (_.isArray(scope.destination)) {
							scope.destination = data;
						} else {
							scope.destination = data[0];
						}
					})
						.catch (function (err) {});
				});
			}
		};
	})
;
