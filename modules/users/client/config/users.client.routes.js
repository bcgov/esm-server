'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      // CLIENT SETTINGS
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {}
      })

      // EDIT USER PROFILE
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
            p.then (function (/* model */) {
              $state.transitionTo('settings.profile', {}, {
                reload: true, inherit: false, notify: true
              });
            })
              .catch (function (/* err */) {
                // swallow error
              });
          };
        }
      })

      // CHANGE PASSWORD
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })

      // AUTHENTICATION
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })

      // INVITES
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

      // PASSWORD RELATED
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

      // GUIDANCE (HELP)
      .state('guidance', {
        url: '/guidance',
        templateUrl: 'modules/guidance/client/views/guidance-main.html'
      })

      // CONTACT US
      .state('contact', {
        url: '/contact',
        templateUrl: 'modules/guidance/client/views/contact.html'
      })

      // DASHBOARD (AKA 'My Projects')
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'modules/users/client/views/user-partials/user-activities.html',
        cache: false,
        resolve: {
          user: function(Authentication) {
            return Authentication.user;
          },
          projects: function (ProjectModel) {
            return ProjectModel.mine();
          }
        },
        controllerAs: 'vm',
        controller: function ($scope, $state, $stateParams, $timeout, NgTableParams, projects, Authentication) {
          var vm = this;
          vm.authentication = Authentication;
          vm.projects = projects;
          vm.tableParams = new NgTableParams ({count:25}, { dataset: vm.projects });
        }
      });
  }
]);
