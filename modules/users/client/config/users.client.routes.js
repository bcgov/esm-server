'use strict';

// Setting up route
angular.module('users').config(['$stateProvider', 'TreeModel', '_',
  function ($stateProvider, TreeModel, _) {
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
        controller: function ($scope, $state, $stateParams, $timeout, NgTableParams, projects, Authentication, ProjectModel, ContextService) {
          var self = this;
          self.authentication = Authentication;
          self.projects = projects;
          self.projectParams = new NgTableParams ({count:50}, {dataset: self.projects});

          self.toggleExpand = toggleExpand;
          self.toggleSelect = toggleSelect;
          self.forceSelect 	= forceSelect;
          self.forceExpand 	= forceExpand;
          self.findSelected = findSelected;

          resetSelected();
          resetExpanded();

          $scope.$on('dropZoneRefresh', function () {
            // After drop zone file upload.
            // To get here a project has been selected.
            var pid = self.findSelected()._id;
            ProjectModel.mine()
              .then(function(results) {
                self.projects = results;
                $scope.$apply();
                // let the new content run through the digest cycle then ...
                $timeout(function () {
                  self.forceExpand(pid);
                },10);
              });
          });

          function toggleExpand (projectId) {
            self.forceSelect(projectId);
            var p = findProject(projectId);
            var oldState = p.expanded;
            resetExpanded();
            p.expanded = !oldState;
          }

          function toggleSelect (projectId) {
            var p = findProject(projectId);
            var oldState = p.selected;
            resetSelected();
            p.selected = !oldState;
            if(p.selected) {
              ContextService.sync({name:'p'}, {projectid: p._id});
            } else {
              ContextService.sync({name:''});
            }
          }

          function forceExpand (projectId) {
            self.forceSelect(projectId);
            var p = findProject(projectId);
            resetExpanded();
            p.expanded = true;
          }

          function forceSelect (projectId) {
            var p = findProject(projectId);
            resetSelected();
            p.selected = true;
            ContextService.sync({name:'p'}, {projectid: p._id});
          }

          function resetSelected () {
            _.forEach(self.projects, function(p) { p.selected = false; });
          }

          function resetExpanded () {
            _.forEach(self.projects, function(p) { p.expanded = false; });
          }

          function findSelected () {
            return _.find(self.projects, function (p) { return p.selected; });
          }

          function findProject (projectId) {
            return _.find(self.projects, function (p) { return p._id === projectId; });
          }
        },
        data: { }
      });
  }
]);
