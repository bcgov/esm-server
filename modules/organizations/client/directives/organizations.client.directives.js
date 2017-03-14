'use strict';

angular.module('organizations')
	.directive('orgSearchChooser', function ($filter, $modal, NgTableParams, ProjectGroupModel, OrganizationModel, _) {
		return {
			restrict: 'A',
			scope: {
				project: '=',
				destination: '=',
				title: '='
			},
			link: function (scope, element, attrs) {
				element.on('click', function () {
					$modal.open({
						animation: true,
						templateUrl: 'modules/organizations/client/views/org-search-chooser.html',
						size: 'lg',
						controllerAs: 's',
						controller: function ($filter, $scope, $modalInstance, _) {
							var s = this;
							s.title = scope.title;
							$scope.cur = scope.destination;

							OrganizationModel.getCollection()
							.then( function (data) {
								if ($scope.cur) {
									_.each(data, function (i) {
										if (i._id === $scope.cur._id) {
											i.Selected = true;
										}
									});
								}
								$scope.orgList = data;
								$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.orgList});
								$scope.$apply();
							});

							$scope.toggleItem = function (item) {
								$scope.cur = item;
							};

							$scope.isChecked = function (i) {
								if ($scope.cur && $scope.cur._id === i._id) {
									return true;
								}
							};

							s.cancel = function () {
								$modalInstance.dismiss('cancel');
							};

							s.ok = function () {
								$modalInstance.close($scope.cur);
							};
						}
					}).result.then(function (data) {
						// console.log("selected:", data);
						scope.destination = data;
					}).catch(function (err) {
						console.log("err:", err);
					});
				});
			}
		};
	})

	.directive('tmplOrganizationsDisplayEdit', directiveOrganizationsDisplayEdit)
	.directive('orgEntry', directiveOrgEntry)
	//.directive('tmplOrganizationsUsersByOrg', directiveOrganizationsUsersByOrg)
;
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Activity Listing
//
// -----------------------------------------------------------------------------------
directiveOrganizationsDisplayEdit.$inject = [];
/* @ngInject */
function directiveOrganizationsDisplayEdit() {
	var directive = {
		restrict: 'E',
		replace: true,
		templateUrl: 'modules/organizations/client/views/organizations-partials/organization-display-edit-form.html',
		controller: 'controllerOrganizationsDisplayEdit',
		controllerAs: 'displayEdit',
		scope: {
			organizationId: '@'
		}
	};
	return directive;
}

directiveOrgEntry.$inject = ['_'];
function directiveOrgEntry(_) {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/organizations/client/views/org-entry.html',
		scope: {
			readonly: '=',
			mode: '=',
			enableDelete: '=',
			enableSave: '=',
			enableEdit: '=',
			enableAddContact: '=',
			enableEditContact: '=',
			enableRemoveContact: '=',
			org: '=',
			users: '=',
			projects: '=',
			control: '=',
			srefReturn: '='
		},
		controller: function ($scope, $attrs, $state, $filter, $modal, _, NgTableParams, Authentication, CodeLists, OrganizationModel, UserModel, ProjectModel) {

			$scope.CodeLists = CodeLists;
			$scope.organizationTypes = CodeLists.organizationTypes;
			$scope.organizationRegisteredIns = CodeLists.organizationRegisteredIns;
			$scope.types = $scope.readonly === true ? CodeLists.organizationTypes.all : CodeLists.organizationTypes.active;
			$scope.registeredIns = $scope.readonly === true ? CodeLists.organizationRegisteredIns.all : CodeLists.organizationRegisteredIns.active;

			$scope.users = _.sortByOrder($scope.users, ['lastName', 'firstName']);
			$scope.userTableParams = new NgTableParams ({count:10}, {dataset: $scope.users});
			$scope.projectTableParams = new NgTableParams ({count:10}, {dataset: $scope.projects});

			$scope.internalControl = $scope.control || {};


			var which = $scope.mode;


			$scope.validate = function () {
			};

			$scope.showSuccess = function (msg, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-success.html',
					controller: function ($scope, $state, $modalInstance, _) {
						var self = this;
						self.title = title || 'Success';
						self.msg = msg;
						self.ok = function () {
							$modalInstance.close($scope.org);
						};
						self.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});
				// do not care how this modal is closed, just go to the desired location...
				modalDocView.result.then(function (res) {
					transitionCallback();
				}, function (err) {
					transitionCallback();
				});
			};

			$scope.showError = function (msg, errorList, transitionCallback, title) {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-error.html',
					controller: function ($scope, $state, $modalInstance, _) {
						var self = this;
						self.title = title || 'An error has occurred';
						self.msg = msg;
						self.ok = function () {
							$modalInstance.close($scope.user);
						};
						self.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md',
					windowClass: 'modal-alert',
					backdropClass: 'modal-alert-backdrop'
				});
				// do not care how this modal is closed, just go to the desired location...
				modalDocView.result.then(function (res) {
					transitionCallback();
				}, function (err) {
					transitionCallback();
				});
			};

			var goToList = function () {
				$state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
			};

			var reloadEdit = function () {
				// want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
				$scope.allowTransition = true;
				$state.reload();
			};

			if (!$scope.internalControl.onSave) {
				$scope.internalControl.onSave = goToList;
			}
			if (!$scope.internalControl.onDelete) {
				$scope.internalControl.onDelete = goToList;
			}
			if (!$scope.internalControl.onCancel) {
				$scope.internalControl.onCancel = goToList;
			}

			$scope.internalControl.deleteOrg = function () {
				var modalDocView = $modal.open({
					animation: true,
					templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
					controller: function ($scope, $state, $modalInstance, _) {
						var self = this;
						self.dialogTitle = "Delete Organization";
						self.name = $scope.org.name;
						self.ok = function () {
							$modalInstance.close($scope.user);
						};
						self.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
					},
					controllerAs: 'self',
					scope: $scope,
					size: 'md'
				});
				modalDocView.result.then(function (res) {
					OrganizationModel.deleteId($scope.org._id)
						.then(function (res) {
							_.each($scope.users, function (u) {
								// These users no longer belong to an org
								u.org = null;
								u.orgName = "";
								UserModel.save(u)
									.then( function (a) {
										console.log("changed:", a);
									});
							});
							// deleted show the message, and go to list...
							$scope.showSuccess('"'+ $scope.org.name +'"' + ' was deleted successfully.', goToList, 'Delete Success');
						})
						.catch(function (res) {
							console.log("res:", res);
							// could have errors from a delete check...
							var failure = _.has(res, 'message') ? res.message : undefined;
							$scope.showError('"'+ $scope.org.name +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
						});
				}, function () {
					//console.log('delete modalDocView error');
				});
			};

			$scope.internalControl.saveOrg = function (isValid) {
				if (!isValid) {
					$scope.$broadcast('show-errors-check-validity', 'organizationForm');
					return false;
				}
				$scope.org.code = $filter('kebab')($scope.org.name);
				var p = (which === 'add') ? OrganizationModel.add($scope.org) : OrganizationModel.save($scope.org);
				p.then(function (model) {
					$scope.showSuccess('"' + $scope.org.name + '"' + ' was saved successfully.', $scope.internalControl.onSave, 'Save Success');
				}).catch(function (err) {
					console.error(err);
					// alert (err.message);
				});
			};


			$scope.removeUserFromOrg = function (userId) {
				console.log("Removing ", userId, " from org ", $scope.org);
				UserModel.lookup(userId)
					.then( function (user) {
						user.org = null;
						user.orgName = "";
						return UserModel.save(user);
					})
					.then( function () {
						return OrganizationModel.getUsers ($scope.org._id);
					})
					.then ( function (users) {
						$scope.users = _.sortByOrder(users, ['lastName', 'firstName']);
						$scope.userTableParams = new NgTableParams ({count:10}, {dataset: $scope.users});
						$scope.$apply();
					});
			};
		}
	};
	return directive;
}