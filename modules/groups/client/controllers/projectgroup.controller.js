'use strict';

angular
	.module('groups', [])
	.controller('GroupEditController', ['$scope', '$state', '$modal', 'Authentication', 'NgTableParams',  '_', 'ProjectGroupModel', 'project', 'group', 'mode', 'CodeLists', function GroupEditController($scope, $state, $modal, Authentication, NgTableParams,  _, ProjectGroupModel, project, group, mode, CodeLists) {
		$scope.project = project;
		$scope.authentication = Authentication;
		$scope.mode = mode;
		// disable the delete button if user doesn't have permission to delete
		$scope.canDelete = $scope.mode === 'edit' && group.userCan.delete;

		$scope.projectGroupTypes = CodeLists.projectGroupTypes;
		$scope.types = CodeLists.projectGroupTypes.active;

		if ($scope.mode === 'edit') {
			// types is mandatory, so if we have an inactive type, we need to set to empty, force an update...
			if (!$scope.projectGroupTypes.isActive(group.type)) {
				group.type = '';
			}
		}

		var self = this;
		self.group = group;
		self.group.project = $scope.project._id;

		$scope.members = angular.copy(self.group.members) || [];
		$scope.existingRecipients = [];
		$scope.members = _.sortByOrder($scope.members, ['lastName', 'firstName']);
		$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.members});

		var populateGroup = function() {
			self.group.members = angular.copy($scope.members);
		};


		$scope.originalData = JSON.stringify(self.group); // used to capture unsaved changes when we leave this route/screen
		$scope.allowTransition = false;

		var $locationChangeStartUnbind = $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			// no check
			if (mode !== 'detail' && !$scope.allowTransition) {

				populateGroup();
				// do the check...
				if ($scope.originalData !== JSON.stringify(self.group)) {
					// something changed...
					// do NOT allow the state change yet.
					event.preventDefault();

					$modal.open({
						animation: true,
						templateUrl: 'modules/vcs/client/views/vc-modal-confirm-cancel.html',
						controller: function($scope, $state, $modalInstance) {
							var self = this;
							self.ok = function() {
								$modalInstance.close();
							};
							self.cancel = function() {
								$modalInstance.dismiss('cancel');
							};
						},
						controllerAs: 'self',
						scope: $scope
					}).result.then(function (res) {
						$scope.allowTransition = true;
						$state.go(toState);
					}, function (err) {
						// cancelled...
					});

				} else {
					//DO NOTHING THERE IS NO CHANGES IN THE FORM
					//console.log('data NOT changed, let my data go!');
				}
			}
		});

		$scope.$on('$destroy', function () {
			window.onbeforeunload = null;
			$locationChangeStartUnbind();
		});

		var partial = function partial(func /*, 0..n args */) {
			var args = Array.prototype.slice.call(arguments, 1);
			return function() {
				var allArguments = args.concat(Array.prototype.slice.call(arguments));
				return func.apply(this, allArguments);
			};
		};

		var goToList = function() {
			$state.transitionTo('p.group.list', {projectid: $scope.project.code}, {
				reload: true, inherit: false, notify: true
			});
		};

		var reloadEdit = function() {
			// want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
			$scope.allowTransition = true;
			$state.reload();
		};

		var goToEdit = function(model) {
			// want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
			$scope.allowTransition = true;
			$state.transitionTo('p.group.edit', {projectid: $scope.project.code, groupId: model._id }, {
				reload: true, inherit: false, notify: true
			});
		};

		var goNowhere = function() {
			// do nothing...
		};

		$scope.$watch(function(scope) { return scope.existingRecipients; },
			function(data) {
				if (data && data.length > 0) {
					_.forEach(data, function(user) {
						var item =  _.find($scope.members, function(o) { return o.email === user.email; });
						if (!item) {
							$scope.members.push(user);
						}
					});
					$scope.existingRecipients = [];
					$scope.members = _.sortByOrder($scope.members, ['lastName', 'firstName']);
					$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.members});
				}
			}
		);

		$scope.removeMember = function(email) {
			var item =  _.find($scope.members, function(o) { return o.email === email; });
			if (item) {
				_.remove($scope.members, function(o) { return o.email === email; });
				$scope.members = _.sortByOrder($scope.members, ['lastName', 'firstName']);
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.members});
			}
		};

		$scope.showError = function(msg, errorList, transitionCallback, title) {
			var modalDocView = $modal.open({
				animation: true,
				templateUrl: 'modules/vcs/client/views/vc-modal-error.html',
				controller: function($scope, $state, $modalInstance, _) {
					var self = this;
					self.title = title || 'An error has occurred';
					self.msg = msg;
					self.errors = errorList;
					self.ok = function() {
						$modalInstance.close();
					};
					self.cancel = function() {
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
			modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
		};

		$scope.showSuccess = function(msg, transitionCallback, title) {
			var modalDocView = $modal.open({
				animation: true,
				templateUrl: 'modules/vcs/client/views/vc-modal-success.html',
				controller: function($scope, $state, $modalInstance, _) {
					var self = this;
					self.title = title || 'Success';
					self.msg = msg;
					self.ok = function() {
						$modalInstance.close();
					};
					self.cancel = function() {
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

		$scope.save = function(isValid) {
			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'mainForm');
				$scope.$broadcast('show-errors-check-validity', 'detailsForm');
				$scope.$broadcast('show-errors-check-validity', 'recipientsForm');
				return false;
			}

			populateGroup();

			if (mode === 'create') {
				ProjectGroupModel.add(self.group)
					.then (function (res) {
						var editFn = partial(goToEdit, res);
						$scope.showSuccess('"'+ self.group.name +'"' + ' was saved successfully', editFn, 'Save Successful');
					})
					.catch (function (err) {
						$scope.showError('"'+ self.group.name +'"' + ' was not saved.', [], goNowhere, 'Save Error');
					});

			} else {
				ProjectGroupModel.save(self.group)
					.then (function (res) {
						$scope.showSuccess('"'+ self.group.name +'"' + ' was saved successfully', reloadEdit, 'Save Successful');
					})
					.catch (function (err) {
						$scope.showError('"'+ self.group.name +'"' + ' was not saved.', [], reloadEdit, 'Save Error');
					});
			}

		};

		$scope.delete = function(model) {
			var modalDocView = $modal.open({
				animation: true,
				templateUrl: 'modules/invitations/client/views/confirm-delete.html',
				controller: function($scope, $state, $modalInstance, ProjectGroupModel, _) {
					var self = this;
					self.group = model;
					self.message = "Are you sure you want to delete '" + model.name + "' from this project?";
					self.ok = function() {
						$modalInstance.close(model);
					};
					self.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
				},
				controllerAs: 'self',
				scope: $scope,
				size: 'md'
			});
			modalDocView.result.then(function (res) {
				ProjectGroupModel.deleteId(model._id)
					.then(function(res) {
						// deleted show the message, and go to list...
						$scope.allowTransition = true;
						$scope.showSuccess('"'+ model.name +'"' + ' was deleted successfully from this project.', goToList, 'Delete Success');
					})
					.catch(function(res) {
						// could have errors from a delete check...
						$scope.showError('"'+ model.name +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
					});
			}, function () {
				//console.log('delete modalDocView error');
			});
		};


		$scope.cancel = function() {
			goToList();
		};

	}]);

