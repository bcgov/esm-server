'use strict';
// =========================================================================
//
// vc routes
//
// =========================================================================
angular.module('core').config(['$stateProvider', function ($stateProvider) {
	$stateProvider
		.state('p.communication', {
			abstract:true,
			url: '/communication',
			template: '<ui-view></ui-view>',
			resolve: {}
		})
		.state('p.communication.list', {
			url: '/list',
			templateUrl: 'modules/communications/client/views/communication-list.html',
			resolve: {
				communications: function ($stateParams, CommunicationModel, project) {
					return CommunicationModel.forProject (project._id);
				}
			},
			controller: function ($scope, $modal, $state, Authentication, NgTableParams, project, communications) {
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: communications});
				$scope.project = project;
				$scope.authentication = Authentication;
				var self = this;

			},
			controllerAs: 'self'
		})
		.state('p.communication.create', {
			url: '/create',
			templateUrl: 'modules/communications/client/views/communication-edit.html',
			resolve: {
				communication: function(CommunicationModel) {
					return CommunicationModel.new();
				}
			},
			controller: function ($scope, $state, $modal, Authentication, NgTableParams,  _, CommunicationModel, project, communication) {
				$scope.project = project;
				$scope.authentication = Authentication;

				var self = this;
				self.communication = communication;
				self.canSend = false;

				$scope.emailTemplate = undefined;
				$scope.artifacts = [];
				$scope.recipients = [];
				$scope.adhocRecipient = undefined;
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});


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
						if (data) {
							// need to add to the recipients list....
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
					}
				};

				$scope.save = function(isValid) {
					if (!isValid) {
						$scope.$broadcast('show-errors-check-validity', 'projectUpdateForm');
						$scope.$broadcast('show-errors-check-validity', 'projectUpdateDetailsForm');
						$scope.$broadcast('show-errors-check-validity', 'recipientsForm');
						return false;
					}
					// set the project...
					self.communication.project = $scope.project._id;
					// set the email template
					if ($scope.emailTemplate && $scope.emailTemplate._id) {
						self.communication.emailTemplate = $scope.emailTemplate._id;
					}
					// set the artifacts list...
					self.communication.artifacts = _.forEach($scope.artifacts, function(o) { return o._id; });
					// create a recipient list...


					CommunicationModel.add(self.communication)
						.then (function (model) {
							$state.transitionTo('p.communication.edit', {projectid:project.code, communicationId: model._id}, {
								reload: true, inherit: false, notify: true
							});
						})
						.catch (function (err) {
							console.error (err);
						});
				};

				$scope.send = function(isValid) {
					// pop up preview and confirmation?

				};

				$scope.cancel = function() {

				};
			},
			controllerAs: 's'
		})
		.state('p.communication.edit', {
			url: '/:communicationId/edit',
			templateUrl: 'modules/communications/client/views/communication-edit.html',
			resolve: {
				communication: function ($stateParams, CommunicationModel) {
					return CommunicationModel.getModel ($stateParams.communicationId);
				}
			},
			controller: function ($scope, $state, $modal, Authentication, NgTableParams,  _, CommunicationModel, project, communication) {
				$scope.project = project;
				$scope.authentication = Authentication;
				$scope.mode = 'edit';

				var self = this;
				self.communication = communication;

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

				$scope.emailTemplate = self.communication.emailTemplate;
				$scope.recipients = angular.copy(self.communication.recipients);
				$scope.adhocRecipient = undefined;
				$scope.artifacts = angular.copy(self.communication.artifacts);
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});

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

					CommunicationModel.save(self.communication)
						.then (function (res) {
							$scope.showSuccess('"'+ self.communication.name +'"' + ' was saved successfully', reloadEdit, 'Save Successful');
						})
						.catch (function (err) {
							$scope.showError('"'+ self.communication.name +'"' + ' was not saved.', [], reloadEdit, 'Save Error');
						});
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

				$scope.cancel = function() {
					goToList();
				};

			},
			controllerAs: 's'
		})
		.state('p.communication.detail', {
			url: '/:communicationId',
			templateUrl: 'modules/communications/client/views/communication-view.html',
			resolve: {
				communication: function ($stateParams, CommunicationModel) {
					return CommunicationModel.getModel ($stateParams.communicationId);
				}
			},
			controller: function ($scope, $state, $modal, Authentication, NgTableParams,  _, CommunicationModel, project, communication) {
				$scope.project = project;
				$scope.authentication = Authentication;

				var self = this;
				self.communication = communication;

				$scope.emailTemplate = self.communication.emailTemplate;
				$scope.recipients = angular.copy(self.communication.recipients);
				$scope.artifacts = angular.copy(self.communication.artifacts);
				$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});


				$scope.cancel = function() {
					$state.transitionTo('p.communication.list', {projectid:project.code}, {
						reload: true, inherit: false, notify: true
					});
				};
			},
			controllerAs: 's'
		});
}]);
