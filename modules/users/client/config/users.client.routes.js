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
				},
				controller: function ($scope, $state, $stateParams, NgTableParams, _, ProjectModel) {
					// console.log (projects);
					// console.log (activities);
					//console.log (JSON.stringify(artifacts));
					$scope.dashboardLoading = true;
					$scope.projects = [];
					$scope.projectParams = new NgTableParams ({count:50}, {dataset: $scope.projects});

					ProjectModel.mine().then(function(data) {
						$scope.projects = data;
						$scope.projectParams = new NgTableParams ({count:50}, {dataset: $scope.projects});
						$scope.dashboardLoading = false;
						$scope.$apply();
					}, function(err) {
						// ?
						$scope.dashboardLoading = false;
						$scope.$apply();

					});
					/*
					$scope.tableParams = new NgTableParams ({count:50}, {dataset: artifacts});

					// filter lists...
					$scope.versionArray = [{id: '', title: 'Any Version'}];
					$scope.stageArray = [{id: '', title: 'Any Stage'}];
					$scope.phaseArray = [{id: '', title: 'Any Phase'}];
					// build out the filter arrays...
					var recs = _(angular.copy(artifacts)).chain().flatten();
					recs.pluck('version').unique().value().map(function (item) {
						$scope.versionArray.push({id: item, title: item});
					});
					recs.pluck('stage').unique().value().map(function (item) {
						$scope.stageArray.push({id: item, title: item});
					});
					try {
						recs.pluck('phase.name').unique().value().map(function (item) {
							$scope.phaseArray.push({id: item, title: item});
						});
					} catch(err) {
						//console.log('error getting the list of phase names to use.');
					}
					*/
					$scope.getLinkUrl = function (state, params) {
						$state.go(state, params);
						// return $state.href (state, params);
					};
				},
				data: { }
			});
	}
]);
