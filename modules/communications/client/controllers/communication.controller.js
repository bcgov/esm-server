'use strict';

angular
	.module('communications', [])
	.controller('EditCommunicationController', ['$scope', '$state', '$modal', 'Authentication', 'NgTableParams',  '_', 'CommunicationModel', 'project', 'communication', 'mode', function EditCommunicationController($scope, $state, $modal, Authentication, NgTableParams,  _, CommunicationModel, project, communication, mode) {
		$scope.project = project;
		$scope.authentication = Authentication;
		$scope.mode = mode;
		// disable the delete button if user doesn't have permission to delete, or the vc is published, or it has related data...
		$scope.canDelete = project.userCan.deleteProjectUpdates && communication.userCan.delete;

		var self = this;
		self.communication = communication;

		$scope.emailTemplate = self.communication.emailTemplate;
		$scope.recipients = angular.copy(self.communication.recipients);
		$scope.adhocRecipient = undefined;
		$scope.artifacts = angular.copy(self.communication.artifacts);
		$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});


		var populateCommunication = function() {
			// call this before save...
			//
			// set the project...
			self.communication.project = $scope.project._id;
			// set the email template
			if ($scope.emailTemplate && $scope.emailTemplate._id) {
				self.communication.emailTemplate = $scope.emailTemplate._id;
			}
			// set the artifacts list...
			self.communication.artifacts = _.forEach($scope.artifacts, function(o) { return o._id; });
			// create a recipient list...
			self.communication.recipients = $scope.recipients;
		};


		$scope.originalData = JSON.stringify(self.communication); // used to capture unsaved changes when we leave this route/screen
		$scope.allowTransition = false;

		var $locationChangeStartUnbind = $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			// no check
			if (mode !== 'detail' && !$scope.allowTransition) {
				// rebuild the communication object and compare...
				populateCommunication();
				// do the check...
				if ($scope.originalData !== JSON.stringify(self.communication)) {
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
						scope: $scope,
						size: 'lg'
					}).result.then(function (res) {
						$scope.allowTransition = true;
						$state.go(toState);
					}, function (err) {
						// cancelled...
					});

				} else {
					//DO NOTHING THERE IS NO CHANGES IN THE FORM
					//console.log('data NOT changed, let my data go!');
				}					}


		});

		$scope.$on('$destroy', function () {
			window.onbeforeunload = null;
			$locationChangeStartUnbind();
		});

		var goToList = function() {
			$state.transitionTo('p.communication.list', {projectid: $scope.project.code}, {
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
			$state.transitionTo('p.communication.edit', {projectid: $scope.project.code, communicationId: model._id }, {
				reload: true, inherit: false, notify: true
			});

		};


		$scope.$watch(function(scope) { return scope.emailTemplate; },
			function(data) {
				if (data && data._id !== undefined) {
					self.communication.templateSubject = data.subject;
					self.communication.templateContent = data.content;
				}
			}
		);
		$scope.$watch(function(scope) { return scope.recipients; },
			function(data) {
				if (data) {
					//
				}
			}
		);
		$scope.$watch(function(scope) { return scope.adhocRecipient; },
			function(data) {
				if (data && data.email !== undefined) {
					// need to add to the recipients list....
					var item =  _.find($scope.recipients, function(o) { return o.email === data.email; });
					if (!item) {
						$scope.recipients.push({displayName: data.name, email: data.email, viaEmail: true, viaMail: false, userId: undefined, org: undefined});
					}
					$scope.adhocRecipient = undefined;
					$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});
				}
			}
		);

		$scope.removeArtifact = function(id) {
			var item =  _.find($scope.artifacts, function(o) { return o._id === id; });
			if (item) {
				_.remove($scope.artifacts, function(o) { return o._id === id; });
			}
		};

		$scope.removeRecipient = function(email) {
			var item =  _.find($scope.recipients, function(o) { return o.email === email; });
			if (item) {
				_.remove($scope.recipients, function(o) { return o.email === email; });
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});
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
			modalDocView.result.then(function (res) {transitionCallback(); }, function (err) { transitionCallback(); });
		};

		var doSend = function(communication) {
			var modalDocView = $modal.open({
				animation: true,
				templateUrl: 'modules/communications/client/views/confirm-send.html',
				controller: function($scope, $state, $modalInstance, CommunicationModel, _) {
					var self = this;
					self.message = "Are you sure you want send '" + communication.name + "' to " + communication.recipients.length + " recipients?";
					self.ok = function() {
						$modalInstance.close();
					};
					self.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
				},
				controllerAs: 'self',
				scope: $scope,
				size: 'md'
			});
			modalDocView.result.then(function () {
				CommunicationModel.save(communication)
					.then(function(saveRes) {
						return CommunicationModel.send(saveRes);
					})
					.then(function(sendRes) {
						$scope.showSuccess('"'+ communication.name +'"' + ' was sent successfully.', goToList, 'Send Success');
					})
					.catch(function(errRes) {
						$scope.showError('"'+ communication.name +'"' + ' was not sent.', [], reloadEdit, 'Send Error');
					});
			}, function () {
				//console.log('delete modalDocView error');
			});
		};

		$scope.save = function(isValid) {
			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'projectUpdateForm');
				$scope.$broadcast('show-errors-check-validity', 'projectUpdateDetailsForm');
				$scope.$broadcast('show-errors-check-validity', 'recipientsForm');
				return false;
			}

			populateCommunication();

			if (mode === 'create') {
				CommunicationModel.add(self.communication)
					.then (function (res) {
						$scope.showSuccess('"'+ self.communication.name +'"' + ' was saved successfully', goToEdit(res), 'Save Successful');
					})
					.catch (function (err) {
						$scope.showError('"'+ self.communication.name +'"' + ' was not saved.', [], Promise.resolve(), 'Save Error');
					});

			} else {
				CommunicationModel.save(self.communication)
					.then (function (res) {
						$scope.showSuccess('"'+ self.communication.name +'"' + ' was saved successfully', reloadEdit, 'Save Successful');
					})
					.catch (function (err) {
						$scope.showError('"'+ self.communication.name +'"' + ' was not saved.', [], reloadEdit, 'Save Error');
					});
			}

		};

		$scope.send = function(isValid) {
			// pop up preview and confirmation?
			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'projectUpdateForm');
				$scope.$broadcast('show-errors-check-validity', 'projectUpdateDetailsForm');
				$scope.$broadcast('show-errors-check-validity', 'recipientsForm');
				return false;
			}
			populateCommunication();
			doSend(self.communication);
		};

		$scope.delete = function(communication) {
			var modalDocView = $modal.open({
				animation: true,
				templateUrl: 'modules/communications/client/views/confirm-delete.html',
				controller: function($scope, $state, $modalInstance, CommunicationModel, _) {
					var self = this;
					self.communication = communication;
					self.message = "Are you sure you want to delete '" + communication.name + "' from this project?";
					self.ok = function() {
						$modalInstance.close(communication);
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
				CommunicationModel.deleteId(communication._id)
					.then(function(res) {
						// deleted show the message, and go to list...
						$scope.allowTransition = true;
						$scope.showSuccess('"'+ communication.name +'"' + ' was deleted successfully from this project.', goToList, 'Delete Success');
					})
					.catch(function(res) {
						// could have errors from a delete check...
						$scope.showError('"'+ communication.name +'"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
					});
			}, function () {
				//console.log('delete modalDocView error');
			});
		};


		$scope.cancel = function() {
			goToList();
		};

	}]);

