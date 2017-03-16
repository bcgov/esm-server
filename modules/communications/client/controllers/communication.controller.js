'use strict';

angular
	.module('communications', [])
	.controller('EditCommunicationController', ['$scope', '$state', '$modal', 'AlertService', 'Authentication', 'NgTableParams',  '_', 'CommunicationModel', 'project', 'communication', 'mode', function EditCommunicationController($scope, $state, $modal, AlertService, Authentication, NgTableParams,  _, CommunicationModel, project, communication, mode) {
		$scope.project = project;
		$scope.authentication = Authentication;
		$scope.mode = mode;
		// disable the delete button if user doesn't have permission to delete, or the vc is published, or it has related data...
		$scope.canDelete = $scope.mode === 'edit' && communication.userCan.delete;

		var self = this;
		self.communication = communication;

		$scope.emailTemplate = null;
		$scope.recipients = angular.copy(self.communication.recipients);
		$scope.documents = angular.copy(self.communication.documents);

		self.downloadAddressList = function () {
			var getBrowser = function() {
				var userAgent = window.navigator.userAgent;
				var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};
				for(var key in browsers) {
					if (browsers[key].test(userAgent)) {
						return key;
					}
				}
			};
			CommunicationModel.prepareAddressCSV($scope.recipients)
				.then( function (data) {
					var blob = new Blob([ data ], { type : 'octet/stream' });
					var url = (window.URL || window.webkitURL).createObjectURL( blob );
					var anchor = document.createElement("a");

					var name = self.communication.name;
					name = name.toLowerCase ();
					name = name.replace (/\W/g,'-');
					name = name.replace (/^-+|-+(?=-|$)/g, '');

					anchor.download = $scope.project.code + '-' + name + '-address-list.csv';
					anchor.href = url;
					var browse = getBrowser();
					if (browse === 'firefox') {
						window.location.href = url;
					}
					anchor.click();
					window.URL.revokeObjectURL(url);
				});
		};


		var transformTemplate = function() {
			var documentHtml = '';
			_.forEach($scope.documents, function(item) {
				// /api/document/:document/fetch
				var url = window.location.origin + '/api/document/' + item._id + '/fetch';
				var li = "<li><a href='" + url + "'>" + item.displayName + "</a></li>";
				if (_.isEmpty(documentHtml)) {
					documentHtml = '<ul>';
				}
				documentHtml += li;
			});
			if (!_.isEmpty(documentHtml)) {
				documentHtml += '</ul>';
			}
			var projectUrl = window.location.origin + '/p/' + $scope.project.code + '/detail';
			var projectUrlHtml = "<a href='" + projectUrl + "'>" + $scope.project.name + "</a>";

			var subject = !_.isEmpty(self.communication.templateSubject) ? self.communication.templateSubject : '';
			subject = subject.replace('%PROJECT_NAME%', $scope.project.name);
			subject = subject.replace('%CURRENT_USER_NAME%', $scope.authentication.user.displayName);
			subject = subject.replace('%CURRENT_USER_EMAIL%', $scope.authentication.user.email);

			var content = !_.isEmpty(self.communication.templateContent) ? self.communication.templateContent : '';
			content = content.replace('%RELATED_CONTENT%', documentHtml);
			content = content.replace('%PROJECT_URL%', projectUrlHtml);
			content = content.replace('%PROJECT_NAME%', $scope.project.name);
			content = content.replace('%CURRENT_USER_NAME%', $scope.authentication.user.displayName);
			content = content.replace('%CURRENT_USER_EMAIL%', $scope.authentication.user.email);

			return {
				subject : subject,
				content: content,
				personalized: subject.includes("%TO_EMAIL%") || subject.includes("%TO_NAME%") || content.includes("%TO_EMAIL%") || content.includes("%TO_NAME%")
			};
		};

		var populateCommunication = function() {
			// call this before save...
			//
			// set the project...
			self.communication.project = $scope.project._id;
			// set the email template
			if ($scope.emailTemplate && $scope.emailTemplate._id) {
				self.communication.emailTemplate = $scope.emailTemplate._id;
			}

			//(use angular copy to remove $$hashKey)...
			// set the artifacts list...
			var theDocuments = _.forEach($scope.documents, function(o) { return o._id; });
			self.communication.documents = angular.copy(theDocuments);
			// create a recipient list...
			self.communication.recipients = [];
			_.each($scope.recipients, function(r) {
				// recipients mgr may have added some extra fields we don't store...
				var arrr = _.omit(angular.copy(r), ['firstName', 'lastName']);
				self.communication.recipients.push(arrr);
			});

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

		$scope.removeDocument = function(id) {
			var item =  _.find($scope.documents, function(o) { return o._id === id; });
			if (item) {
				_.remove($scope.documents, function(o) { return o._id === id; });
			}
		};

		$scope.addDocuments = function(data) {
			if (data) {
				_.each(data, function(d) {
					var f = _.find($scope.documents, function(r) { return r._id.toString() === d._id.toString(); });
					if (!f) {
						//ok, add this to the list.
						if (_.isEmpty(d.displayName)) {
							d.displayName = d.documentFileName || d.internalOriginalName;
						}
						$scope.documents.push(d);
					}
				});
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
			modalDocView.result.then(function (res) {
				transitionCallback();
			}, function (err) {
				transitionCallback();
			});
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

		var doSend = function(communication) {
			if (communication.recipients.length === 0) {
				AlertService.error('Must have at least one recipient to send.');
				return;
			}
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
						$scope.allowTransition = true;
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
						function editWithResult() {
							goToEdit(res);
						}
						$scope.showSuccess('"'+ self.communication.name +'"' + ' was saved successfully', editWithResult, 'Save Successful');
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

		$scope.hasMailRecipients = function() {
			return _.some($scope.recipients, 'viaMail', true);
		};


	}]);

