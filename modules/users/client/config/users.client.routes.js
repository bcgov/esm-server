'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function ($stateProvider) {
		// Users state routing
		$stateProvider

			// Landing Page (Home)
			.state('home', {
				url: '/',
				templateUrl: 'modules/home/client/views/home.html'
			})

			// Authorizations
			.state('authorizations', {
				url: '/authorizations',
				templateUrl: 'modules/authorizations/client/views/authorizations.html'
			})

			// Compliance Oversight
			.state('compliance-oversight', {
				url: '/compliance-oversight',
				templateUrl: 'modules/compliance-oversight/client/views/compliance-oversight.html'
			})

			// Legislation
			.state('legislation', {
				url: '/legislation',
				templateUrl: 'modules/legislation/client/views/legislation.html'
			})

			// Mining Lifecycle
			.state('mining-lifecycle', {
				url: '/lifecycle',
				templateUrl: 'modules/lifecycle/client/views/mining-lifecycle.html'
			})

			// Topics
			.state('topics', {
				url: '/topics-of-interest',
				templateUrl: 'modules/topics/client/views/topics-of-interest.html'
			})
			.state('reclamation-and-securities', {
				url: '/reclamation-and-securities',
				templateUrl: 'modules/topics/client/views/reclamation-and-securities.html'
			})
			.state('tailings-management', {
				url: '/water-quality',
				templateUrl: 'modules/topics/client/views/tailings-management.html'
			})
			.state('water-quality', {
				url: '/water-quality',
				templateUrl: 'modules/topics/client/views/water-quality.html'
			})

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
				controller: function ($scope, $state, user, UserModel, $filter, SALUTATIONS) {
					$scope.user = user;
					$scope.salutations = SALUTATIONS;

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
			.state('authentication', {
				abstract: true,
				url: '/authentication',
				templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
			})
			.state('settings.invite', {
				url: '/invite',
				templateUrl: 'modules/users/client/views/settings/invite.client.view.html',
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
			.state('contact', {
				url: '/contact',
				templateUrl: 'modules/guidance/client/views/contact.html'
			})
			
			.state('activities', {
				url: '/activities',
				templateUrl: 'modules/users/client/views/user-partials/user-activities.html',
				resolve: {
					activities: function(ActivityModel) {
						return ActivityModel.userActivities (null, 'write');
					},
					projects: function(ProjectModel) {
						return ProjectModel.mine ();
					},
					artifacts: function(ArtifactModel) {
						return ArtifactModel.mine ();
					},
					lookup: function(ProjectModel) {
						return ProjectModel.lookup ();
					}
				},
				controller: function ($scope, $state, $stateParams, lookup, activities, projects, artifacts, NgTableParams, _) {
					// console.log (projects);
					// console.log (activities);
					//console.log (JSON.stringify(artifacts));


					$scope.projectParams = new NgTableParams ({count:50}, {dataset: projects});
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

					$scope.getLinkUrl = function (state, params) {
						$state.go(state, params);
						// return $state.href (state, params);
					};
				},
				data: { }
			});
	}
]);
