'use strict';

angular
	.module('invitations', [])
	.controller('EditInvitationController', ['$scope', '$state', '$modal', 'Authentication', 'NgTableParams',  '_', 'CommunicationModel', 'project', 'communication', 'mode', function EditInvitationController($scope, $state, $modal, Authentication, NgTableParams,  _, CommunicationModel, project, communication, mode) {
		$scope.project = project;
		$scope.authentication = Authentication;
		$scope.mode = mode;
		// disable the delete button if user doesn't have permission to delete, or the vc is published, or it has related data...
		$scope.canDelete = $scope.mode === 'edit' && project.userCan.deleteProjectInvitation && communication.userCan.delete;

		var self = this;
		self.communication = communication;
		self.communication.type = 'Invitation';

		$scope.emailTemplate = self.communication.emailTemplate;
		$scope.recipients = angular.copy(self.communication.recipients);
		$scope.existingRecipients = [];
		$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});


		var transformTemplate = function() {

			var subject = !_.isEmpty(self.communication.templateSubject) ? self.communication.templateSubject : '';
			subject = subject.replace('%PROJECT_NAME%', $scope.project.name);
			subject = subject.replace('%CURRENT_USER_NAME%', $scope.authentication.user.displayName);
			subject = subject.replace('%CURRENT_USER_EMAIL%', $scope.authentication.user.email);

			var content = !_.isEmpty(self.communication.templateContent) ? self.communication.templateContent : '';
			content = content.replace('%PROJECT_NAME%', $scope.project.name);
			content = content.replace('%CURRENT_USER_NAME%', $scope.authentication.user.displayName);
			content = content.replace('%CURRENT_USER_EMAIL%', $scope.authentication.user.email);

			return {
				subject : subject,
				content: content,
				personalized: true
			};
		};

		var populateCommunication = function() {
			// call this before save...
			//
			// set the project...
			self.communication.type = 'Invitation';
			self.communication.project = $scope.project._id;
			// set the email template
			if ($scope.emailTemplate && $scope.emailTemplate._id) {
				self.communication.emailTemplate = $scope.emailTemplate._id;
			}

			//(use angular copy to remove $$hashKey)...
			// create a recipient list...
			self.communication.recipients = angular.copy($scope.recipients);

			var xformEmail = transformTemplate();
			self.communication.subject = xformEmail.subject;
			self.communication.content = xformEmail.content;
			self.communication.personalized = xformEmail.personalized;
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
				}
			}
		});

		$scope.$on('$destroy', function () {
			window.onbeforeunload = null;
			$locationChangeStartUnbind();
		});

		var goToList = function() {
			$state.transitionTo('p.invitation.list', {projectid: $scope.project.code}, {
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
			$state.transitionTo('p.invitation.edit', {projectid: $scope.project.code, communicationId: model._id }, {
				reload: true, inherit: false, notify: true
			});
		};

		var goNowhere = function() {
			// do nothing...
		};


		$scope.$watch(function(scope) { return scope.emailTemplate; },
			function(data) {
				if (data && data._id !== undefined) {
					self.communication.templateSubject = data.subject;
					self.communication.templateContent = data.content;
				}
			}
		);

		$scope.$watch(function(scope) { return scope.existingRecipients; },
			function(data) {
				if (data && data.length > 0) {
					//
					_.forEach(data, function(user) {
						var item =  _.find($scope.recipients, function(o) { return o.email === user.email; });
						if (!item) {
							var viaEmail = user.viaEmail;
							var viaMail = user.viaMail;
							var emailAddress = user.email;

							if (_.startsWith(user.email, "none@specified.com")) {
								viaEmail = false;
								viaMail = true;
								emailAddress = '';
							}
							$scope.recipients.push({displayName: user.displayName, email: emailAddress, viaEmail: viaEmail, viaMail: viaMail, userId: user._id, org: user.orgName});
						}
					});
					$scope.existingRecipients = [];
					$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});
				}
			}
		);

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
				templateUrl: 'modules/invitations/client/views/confirm-send.html',
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
						$scope.showSuccess('"'+ communication.name +'"' + ' was sent successfully.', reloadEdit, 'Send Success');
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
				$scope.$broadcast('show-errors-check-validity', 'mainForm');
				$scope.$broadcast('show-errors-check-validity', 'detailsForm');
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
						$scope.showError('"'+ self.communication.name +'"' + ' was not saved.', [], goNowhere, 'Save Error');
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
				$scope.$broadcast('show-errors-check-validity', 'mainForm');
				$scope.$broadcast('show-errors-check-validity', 'detailsForm');
				$scope.$broadcast('show-errors-check-validity', 'recipientsForm');
				return false;
			}
			populateCommunication();
			doSend(self.communication);
		};

		$scope.delete = function(communication) {
			var modalDocView = $modal.open({
				animation: true,
				templateUrl: 'modules/invitations/client/views/confirm-delete.html',
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

