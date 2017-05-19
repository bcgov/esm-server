'use strict';

// Setting up route
angular.module('users').config(['$stateProvider', 'TreeModel',
	function ($stateProvider, TreeModel) {
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
			// Activities appear as Dashboard to user. Now includes DropZone.
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
								// Need project directory structure for each project to support moving files to doc manager
								// NB. Promise.All is not supported in IE so ...
								var cnt = projects.length;
								if (cnt === 0) {
									return resolve(projects);
								}
								_.forEach(projects, function (project) {
									if (project.rootNode) {
										cnt--;
										if (cnt === 0) {
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
											cnt--;
											if (cnt === 0) {
												return resolve(projects);
											}
										});
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
					// TODO figure out how to limit the drop button to proponents only and move button to staff only
					_.forEach(projects,function(project){
						console.log("project.userCan", project);
					});
					self.projectParams = new NgTableParams ({count:50}, {dataset: self.projects});
				},
				data: { }
			});
	}
]);
