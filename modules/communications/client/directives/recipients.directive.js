'use strict';
angular.module('communications')

	.directive('recipientsMgr', ['_', 'moment', 'NgTableParams', 'Authentication', 'AlertService', 'ConfirmService', 'ProjectModel', 'CommunicationModel', 'UserModel', function (_, moment, NgTableParams, Authentication, AlertService, ConfirmService, ProjectModel, CommunicationModel, UserModel) {
		return {
			restrict: 'E',
			scope: {
				project: '=',
				recipients: '=',
				mode: '=',
				enableAddNew: '=',
				enableAddExisting: '=',
				enableCc: '=',
				enableBcc: '=',
				showMail: '='
			},
			templateUrl: 'modules/communications/client/views/recipients-manager.html',
			controller: function ($scope, $filter, $log, $modal, $timeout, _, moment, Authentication, AlertService, ConfirmService, ProjectModel, CommunicationModel, UserModel) {

				// targets for adding new or existing recipients...
				$scope.adhocTo = undefined;
				$scope.existingTo = [];

				$scope.adhocCc = undefined;
				$scope.existingCc = [];

				$scope.adhocBcc = undefined;
				$scope.existingBcc = [];
				//

				// the complete list of recipients filtered into types...
				$scope.recipientsTo = [];
				$scope.recipientsCc = [];
				$scope.recipientsBcc = [];
				$scope.recipientsMail = [];


				var refresh = function() {

					var users = [];
					Promise.resolve()
						.then(function() {
							if ($scope.enableAddNew) {
								return [];
							} else {
								return UserModel.allUsers();
							}
						})
						.then(function(data) {
							users = data;

							$scope.recipientsTo = [];
							$scope.recipientsCc = [];
							$scope.recipientsBcc = [];
							$scope.recipientsMail = [];

							// sort recipients list...
							if ($scope.enableAddNew) {
								$scope.recipients = _.sortByOrder($scope.recipients, function(o) { return o.email.toLowerCase(); }, "asc");
							} else {
								// ugly.
								// recipients aren't users - they can be adhoc, so we don't have the lastName/firstName
								// in this situation, we are only dealing with a communication to contacts/users, so flesh them out.
								if (_.size(users) > 0) {
									_.each($scope.recipients, function(o) {
										var user = _.find(users, function(u) { return u._id.toString() === o.userId; });
										if (user) {
											o.lastName = user.lastName;
											o.firstName = user.firstName;
										}
									});
								}
								// and sort...
								$scope.recipients = _.sortByOrder($scope.recipients, ['lastName', 'firstName']);
							}

							_.each($scope.recipients, function(r) {
								if (r.type === 'bcc' && !$scope.enableBcc) {
									r.type = 'cc';
								}
								if (r.type === 'cc' && !$scope.enableCc) {
									r.type = 'to';
								}
								switch(r.type) {
									case 'bcc':
										$scope.recipientsBcc.push(r);
										break;
									case 'cc':
										$scope.recipientsCc.push(r);
										break;
									default:
										$scope.recipientsTo.push(r);
										break;
								}
								if (r.viaMail) {
									$scope.recipientsMail.push(r);
								}
							});
							$scope.recipientsMail = _.uniq($scope.recipientsMail);

							// clear out the targets so we can watch when they are changed.
							$scope.adhocTo = undefined;
							$scope.existingTo = [];

							$scope.adhocCc = undefined;
							$scope.existingCc = [];

							$scope.adhocBcc = undefined;
							$scope.existingBcc = [];

							// reset the table with ALL the recipients...
							//$scope.tableParams = new NgTableParams ({count:10}, {dataset: $scope.recipients});
							$scope.tableParamsTo = new NgTableParams ({count:10}, {dataset: $scope.recipientsTo});
							$scope.tableParamsCc = new NgTableParams ({count:10}, {dataset: $scope.recipientsCc});
							$scope.tableParamsBcc = new NgTableParams ({count:10}, {dataset: $scope.recipientsBcc});
							$scope.tableParamsMail = new NgTableParams ({count:10}, {dataset: $scope.recipientsMail});
						});


				};

				var addExisting = function(data, type) {
					if (data && data.length > 0) {
						_.forEach(data, function(user) {
							var item =  _.find($scope.recipients, function(o) { return o._id === user._id; });
							if (!item) {
								if (_.startsWith(user.email, "none@specified.com") || _.isEmpty(user.email)) {
									user.viaEmail = false;
									user.email = '';
								}
								user.org = user.orgName;
								user.userId = user._id;
								user.type = type;
								$scope.recipients.push(user);
							} else {
								// maybe we are moving them from cc to bcc...
								item.type = type;
							}
						});

						refresh();
					}
				};

				var addNew = function(data, type) {
					if (data && data.email !== undefined) {
						// need to add to the recipients list....
						var item =  _.find($scope.recipients, function(o) { return o.email === data.email; });
						if (!item) {
							$scope.recipients.push({displayName: data.name, email: data.email, viaEmail: true, viaMail: false, userId: undefined, org: undefined, type: type});
						} else {
							// maybe we are moving them from cc to bcc...
							item.type = type;
						}
						refresh();
					}

				};

				$scope.$watch(function(scope) { return scope.existingTo; },
					function(data) {
						addExisting(data, 'to');
					}
				);
				$scope.$watch(function(scope) { return scope.existingCc; },
					function(data) {
						addExisting(data, 'cc');
					}
				);
				$scope.$watch(function(scope) { return scope.existingBcc; },
					function(data) {
						addExisting(data, 'bcc');
					}
				);

				$scope.$watch(function(scope) { return scope.adhocTo; },
					function(data) {
						addNew(data, 'to');
					}
				);
				$scope.$watch(function(scope) { return scope.adhocCc; },
					function(data) {
						addNew(data, 'cc');
					}
				);
				$scope.$watch(function(scope) { return scope.adhocBcc; },
					function(data) {
						addNew(data, 'bcc');
					}
				);


				// remove recipient
				$scope.removeRecipient = function(email) {
					var item =  _.find($scope.recipients, function(o) { return o.email === email; });
					if (item) {
						_.remove($scope.recipients, function(o) { return o.email === email; });
						refresh();
					}
				};

				// change recipient type
				$scope.changeRecipientType = function(email, type) {
					var item =  _.find($scope.recipients, function(o) { return o.email === email; });
					if (item) {
						item.type = type;
						refresh();
					}
				};


				refresh();

			},
			controllerAs: 'recipientsMgr'
		};
	}])

;
