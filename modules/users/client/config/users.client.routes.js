'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function ($stateProvider) {
		// Users state routing
		$stateProvider
			.state('settings', {
				abstract: true,
				url: '/settings',
				templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
				data: {}
			})
			.state('settings.profile', {
				url: '/profile',
				templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
				resolve: {
					user: function (UserModel) {
						return UserModel.me ();
					}
				},
				controller: function ($scope, $state, user, UserModel, CodeLists, $filter) {
					$scope.user = user;
					$scope.salutations = CodeLists.salutations.active;

					var which = 'edit';
					$scope.calculateName = function() {
						$scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ').replace(/\s+/g, ' ');
					};
					
					$scope.save = function (isValid) {
						if (!$scope.user.username || $scope.user.username === '') {
							$scope.user.username = $filter('kebab')( $scope.user.displayName );
						}
						if (!isValid) {
							$scope.$broadcast('show-errors-check-validity', 'userForm');
							return false;
						}
						var p = (which === 'add') ? UserModel.add ($scope.user) : UserModel.save ($scope.user);
						p.then (function (model) {
								$state.transitionTo('settings.profile', {}, {
									reload: true, inherit: false, notify: true
								});
							})
							.catch (function (err) {
								console.error (err);
								// alert (err.message);
							});
					};
				}
			})
			.state('settings.password', {
				url: '/password',
				templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
			})
			/*
				deleted these templates, too.
			.state('settings.accounts', {
				url: '/accounts',
				templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
			})
			.state('settings.picture', {
				url: '/picture',
				templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
			})
			*/
			.state('authentication', {
				abstract: true,
				url: '/authentication',
				templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
			})
			.state('settings.invite', {
				url: '/invite',
				templateUrl: 'modules/users/client/views/settings/invite.client.view.html',
				/*data: {
					roles: ['user', 'admin']
				}*/
			})
			// TODO: Siteminder! when Siteminder is in place and we have Admin users, remove this state
			.state('authentication.local', {
				url: '/local/signin',
				template: '<tmpl-login></tmpl-login>'
			})
		// TODO: Siteminder! when Siteminder is in place and we have Admin users, make this state = authentication.signin
			.state('authentication.signin', {
				url: '/signin',
				controller: function() {
					// send them to the server, so that siteminder will authenticate, then send into our code to fully authorize.
					window.location.href = window.location.origin + '/authentication/signin';
				}
			})
			.state('password', {
				abstract: true,
				url: '/password',
				template: '<ui-view/>'
			})
			.state('password.forgot', {
				url: '/forgot',
				templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
			})
			.state('password.reset', {
				abstract: true,
				url: '/reset',
				template: '<ui-view/>'
			})
			.state('password.reset.invalid', {
				url: '/invalid',
				templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
			})
			.state('password.reset.success', {
				url: '/success',
				templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
			})
			.state('password.reset.form', {
				url: '/:token',
				templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
			})
			.state('guidance', {
				url: '/guidance',
				templateUrl: 'modules/guidance/client/views/guidance-main.html'
			})
			.state('contact', {
				url: '/contact',
				templateUrl: 'modules/guidance/client/views/contact.html'
			})
			
			.state('activities', {
				url: '/activities',
				templateUrl: 'modules/users/client/views/user-partials/user-activities.html',
				cache: false,
				resolve: {
					user: function(Authentication) {
						return Authentication.user;
					},
					projects: function (ProjectModel, Document, _, user) {
						// Don't load projects unless user is authorized
						// Because otherwise they see everything
						if (!user) {
							return [];
						}
						var tree = new TreeModel();
						return ProjectModel.mine()
						.then(function (projects) {
							return Document.getDropZoneDocumentsForProjects(projects)
							.then(function (dzFileList) {
								_.forEach(projects, function (project) {
									project.dropZoneFiles = _.filter(dzFileList, function (doc) {
										return doc.project === project._id;
									});
								});
								return projects;
							});
						})
						.then(function (projects) {
							return new Promise(function (resolve, reject) {
								var cnt = projects.length;
								if (cnt === 0) {
									return resolve(projects);
								}
								_.forEach(projects, function (project) {
									if (project.rootNode) {
										cnt--;
										if (cnt === 0) {
											console.log("resolve on no projects");
											return resolve(projects);
										}
									} else {
										ProjectModel.getProjectDirectory(project)
										.then(function (dir) {
											project.directoryStructure = dir || {
													id: 1,
													lastId: 1,
													name: 'ROOT',
													published: true
												};
											project.rootNode = tree.parse(project.directoryStructure);
											//console.log("resolve    project.directoryStructure", project.directoryStructure);
											//console.log("resolve    project.rootNode", project.rootNode);
											cnt--;
											if (cnt === 0) {
												return resolve(projects);
											}
										})
									}
								});
							});
						});
					}
				},
				controllerAs: 'vm',
				controller: function ($scope, $state, $stateParams, NgTableParams, _, projects, Authentication) {
					var self = this;
					self.authentication = Authentication;
					self.projects = projects;
					self.projectParams = new NgTableParams ({count:50}, {dataset: self.projects});
					self.getLinkUrl = function (state, params) {
						$state.go(state, params);
						// return $state.href (state, params);
					};
					self.moveOptions = {
						titleText: 'Move File To Documents',
						okText: 'Yes',
						cancelText: 'No',
						ok: function(destination) {
							if (!destination) {
								return Promise.reject('Destination required for moving files and folders.');
							} else {
								var dirs = _.size(self.checkedDirs);
								var files = _.size(self.checkedFiles);
								if (dirs === 0 && files === 0) {
									return Promise.resolve();
								} else {
									self.busy = true;

									var dirPromises = _.map(self.moveSelected.moveableFolders, function (d) {
										return DocumentMgrService.moveDirectory($scope.project, d, destination);
									});

									var filePromises = _.map(self.moveSelected.moveableFiles, function (f) {
										f.directoryID = destination.model.id;
										return Document.save(f);
									});

									var directoryStructure;

									return Promise.all(dirPromises)
									.then(function (result) {
										//$log.debug('Dir results ', JSON.stringify(result));
										if (!_.isEmpty(result)) {
											var last = _.last(result);
											directoryStructure = last.data;
										}
										return Promise.all(filePromises);
									})
									.then(function (result) {
										//$log.debug('File results ', JSON.stringify(result));
										if (directoryStructure) {
											//$log.debug('Setting the new directory structure...');
											$scope.project.directoryStructure = directoryStructure;
											$scope.$broadcast('documentMgrRefreshNode', { directoryStructure: directoryStructure });
										}
										//$log.debug('select and refresh destination directory...');
										self.selectNode(destination.model.id);
										AlertService.success('The selected items were moved.');
									}, function (err) {
										self.busy = false;
										AlertService.error("The selected items could not be moved.");
									});
								}
							}
						},
						cancel: undefined,
						confirmText:  'Are you sure you want to move the selected item?',
						confirmItems: [],
						// moveableFolders: [],
						// moveableFiles: [],
						setContext: function() {
							self.moveOptions.confirmItems = [];
							self.moveOptions.titleText = 'Move selected';
							self.moveOptions.confirmText = 'Are you sure you want to move the following the selected item?';
							self.moveOptions.confirmText = 'Are you sure you want to move the following ('+ files +') selected files?';
							self.moveOptions.confirmItems = [];
							self.moveOptions.moveableFiles = [];
							// _.each(self.checkedFiles, function(o) {
							// 	if (o.userCan.write) {
							// 		var name = o.displayName || o.documentFileName || o.internalOriginalName;
							// 		self.moveSelected.confirmItems.push(name);
							// 		self.moveSelected.moveableFiles.push(o);
							// 	}
							// });
						}
					};
				},
				data: { }
			});
	}
]);
