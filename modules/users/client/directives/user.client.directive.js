'use strict';

angular
  .module('user')
  .directive('tmplQuicklinksThumbnails', directiveQuicklinksThumbnails)
  .directive('tmplCompanyEntryForm', directiveCompanyEntryForm)
  .directive('tmplUserEntryForm', directiveUserEntryForm)
  .directive('modalSetSignature', directiveSetSignature)
  .directive('modalEditMyProfile', directiveEditMyProfile)
  .directive('userEntry', directiveUserEntry);

function directiveUserEntry() {
  var directive = {
    restrict: 'E',
    templateUrl: 'modules/users/client/views/user-entry.html',
    scope: {
      readonly: '=',
      mode: '=',
      enableNotes: '=',
      enableSignature: '=',
      enableDelete: '=',
      enableSave: '=',
      enableEdit: '=',
      enableSetOrganization: '=',
      showDisplayName: '=',
      showUsername: '=',
      org: '=',
      user: '=',
      groupsAndRoles: '=',
      control: '=',
      srefReturn: '='
    },
    controller: function ($scope, $attrs, $state, $filter, $uibModal, _, Authentication, CodeLists, UserModel) {
      $scope.CodeLists = CodeLists;
      $scope.salutations = $scope.readonly === true ? CodeLists.salutations.all : CodeLists.salutations.active;
      $scope.internalControl = $scope.control || {};

      var which = $scope.mode;

      if ($scope.org && $scope.user && !$scope.user.org) {
        $scope.user.org = $scope.org;
      }

      if ($scope.user.viaEmail && $scope.user.viaMail) {
        $scope.user.viaMail = false;
      }
      if (!$scope.user.viaEmail && !$scope.user.viaMail) {
        $scope.user.viaEmail = true;
      }

      $scope.validate = function () {
        // eslint-disable-next-line no-useless-escape
        var phonregexp = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;
        if (phonregexp.test($scope.user.phoneNumber)) {
          $scope.userForm.phoneNumber.$setValidity('required', true);
        } else {
          $scope.userForm.phoneNumber.$setValidity('required', false);
        }
      };

      $scope.internalControl.calculateName = function () {
        $scope.user.displayName = [$scope.user.firstName, $scope.user.middleName, $scope.user.lastName].join(' ').replace(/\s+/g, ' ');
      };

      $scope.internalControl.clearOrganization = function () {
        $scope.user.org = null;
      };

      $scope.internalControl.clearSignature = function () {
        $scope.user.signature = null;
      };

      $scope.setPreferredContactMethod = function(value) {
        $scope.user.viaEmail = ('viaEmail' === value);
        $scope.user.viaMail = ('viaMail' === value);
      };

      $scope.showSuccess = function (msg, transitionCallback, title) {
        var modalDocView = $uibModal.open({
          animation: true,
          templateUrl: 'modules/utils/client/views/partials/modal-success.html',
          controller: function ($scope, $state, $uibModalInstance) {
            var self = this;
            self.title = title || 'Success';
            self.msg = msg;
            self.ok = function () {
              $uibModalInstance.close($scope.user);
            };
            self.cancel = function () {
              $uibModalInstance.dismiss('cancel');
            };
          },
          controllerAs: 'self',
          scope: $scope,
          size: 'md',
          windowClass: 'modal-alert',
          backdropClass: 'modal-alert-backdrop'
        });
        // do not care how this modal is closed, just go to the desired location...
        modalDocView.result.then(function (/* res */) {
          transitionCallback();
        }, function (/* err */) {
          transitionCallback();
        });
      };

      $scope.showError = function (msg, errorList, transitionCallback, title) {
        var modalDocView = $uibModal.open({
          animation: true,
          templateUrl: 'modules/utils/client/views/partials/modal-error.html',
          controller: function ($scope, $state, $uibModalInstance) {
            var self = this;
            self.title = title || 'An error has occurred';
            self.msg = msg;
            self.ok = function () {
              $uibModalInstance.close($scope.user);
            };
            self.cancel = function () {
              $uibModalInstance.dismiss('cancel');
            };
          },
          controllerAs: 'self',
          scope: $scope,
          size: 'md',
          windowClass: 'modal-alert',
          backdropClass: 'modal-alert-backdrop'
        });
        // do not care how this modal is closed, just go to the desired location...
        modalDocView.result.then(function (/* res */) {
          transitionCallback();
        }, function (/* err */) {
          transitionCallback();
        });
      };

      var goToList = function () {
        $state.transitionTo($scope.srefReturn, {}, {reload: true, inherit: false, notify: true});
      };

      var reloadEdit = function () {
        // want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
        $scope.allowTransition = true;
        $state.reload();
      };

      if (!$scope.internalControl.onSave) {
        $scope.internalControl.onSave = goToList;
      }
      if (!$scope.internalControl.onDelete) {
        $scope.internalControl.onDelete = goToList;
      }
      if (!$scope.internalControl.onCancel) {
        $scope.internalControl.onCancel = goToList;
      }

      $scope.internalControl.deleteUser = function () {
        var modalDocView = $uibModal.open({
          animation: true,
          templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
          controller: function ($scope, $state, $uibModalInstance) {
            var self = this;
            self.dialogTitle = "Delete Contact";
            self.name = $scope.user.displayName;
            self.ok = function () {
              $uibModalInstance.close($scope.user);
            };
            self.cancel = function () {
              $uibModalInstance.dismiss('cancel');
            };
          },
          controllerAs: 'self',
          scope: $scope,
          size: 'md'
        });
        modalDocView.result.then(function (/* res */) {
          UserModel.deleteId($scope.user._id)
            .then(function (/* res */) {
              // deleted show the message, and go to list...
              $scope.showSuccess('"' + $scope.user.displayName + '"' + ' was deleted successfully.', $scope.internalControl.onDelete, 'Delete Success');
            })
            .catch(function (/* res */) {
              // could have errors from a delete check...
              $scope.showError('"' + $scope.user.displayName + '"' + ' was not deleted.', [], reloadEdit, 'Delete Error');
            });
        }, function () {
          // swallow rejected promise error
        });
      };

      $scope.internalControl.saveUser = function (isValid) {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'userForm');
          $scope.$broadcast('show-errors-check-validity', 'detailsForm');
          $scope.$broadcast('show-errors-check-validity', 'orgForm');
          $scope.$broadcast('show-errors-check-validity', 'signatureForm');
          $scope.$broadcast('show-errors-check-validity', 'notesForm');
          $scope.$broadcast('show-errors-check-validity', 'projectsForm');
          return false;
        }
        var p = (which === 'add') ? UserModel.add($scope.user) : UserModel.save($scope.user);
        p.then(function (/* model */) {
          $scope.showSuccess('"' + $scope.user.displayName + '"' + ' was saved successfully.', $scope.internalControl.onSave, 'Save Success');
        })
          .catch(function (/* err */) {
            // swallow error
          });
      };

      // signatures are only for the current user....
      $scope.internalControl.signatureHREF = "/api/document/" + $scope.user.signature + "/fetch";
      $scope.$on('refreshSig', function() {
        if ($scope.enableSignature) {
          UserModel.me()
            .then( function (u) {
              $scope.user.signature = u.signature;
              $scope.internalControl.signatureHREF = "/api/document/" + u.signature + "/fetch";
            });
          $scope.$apply();
        }
      });
    }
  };
  return directive;
}// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Entry Form
//
// -----------------------------------------------------------------------------------
directiveEditMyProfile.$inject = ['$uibModal'];
/* @ngInject */
function directiveEditMyProfile($uibModal) {
  var directive = {
    restrict:'A',
    scope : {
      project: '='
    },
    link : function(scope, element) {
      element.on('click', function() {
        var modalDocView = $uibModal.open({
          animation: true,
          templateUrl: 'modules/users/client/views/user-edit-modal.html',
          controllerAs: 'userEditControl',
          resolve: {
            user: function(UserModel, Authentication) {
              return UserModel.lookup(Authentication.user._id);
            },
            groupsAndRoles: function(UserModel, Authentication) {
              return UserModel.groupsAndRoles(Authentication.user._id);
            }
          },
          controller: function($scope, $filter, $uibModalInstance, user, groupsAndRoles) {
            $scope.user = user;
            $scope.groupsAndRoles = groupsAndRoles;
            $scope.mode = 'edit';
            $scope.readonly = false;
            $scope.enableDelete = false;
            $scope.enableSave = true;
            $scope.enableEdit = false;
            $scope.enableSetOrganization = false;
            $scope.enableSignature = false;
            $scope.enableNotes = false;
            $scope.showDisplayName = false;
            $scope.showUsername = false;

            var userEditControl = this;
            userEditControl.title = 'Edit Profile';
            userEditControl.cancel = function() {
              $uibModalInstance.dismiss('cancel');
            };
            userEditControl.onSave = function() {
              $uibModalInstance.close();
            };
            // we pass this to the user entry directive/controller for communication between the two...
            $scope.userEntryControl = {
              onSave: userEditControl.onSave
            };
          },
          size: 'lg'
        });
        modalDocView.result.then(function (data) {
          scope.user = data;
        }, function () {});
      });
    }
  };
  return directive;
}

directiveSetSignature.$inject = ['$uibModal'];
/* @ngInject */
function directiveSetSignature($uibModal) {
  var directive = {
    restrict:'A',
    link : function(scope, element) {
      element.on('click', function() {
        $uibModal.open({
          animation: true,
          templateUrl: 'modules/documents/client/views/partials/document-upload-signature.html',
          controllerAs: 'sigUp',
          controller: 'controllerSignatureUpload'
        });
      });
    }
  };
  return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Modal Project Schedule
//
// -----------------------------------------------------------------------------------
function directiveQuicklinksThumbnails() {

  var directive = {
    restrict: 'E',
    templateUrl: 'modules/users/client/views/user-partials/user-quicklinks.html',
    controller: 'controllerUsersQuicklinks',
    controllerAs: 'uql'
  };
  return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Company Entry Form
//
// -----------------------------------------------------------------------------------
function directiveCompanyEntryForm() {

  var directive = {
    restrict: 'E',
    templateUrl: 'modules/users/client/views/user-partials/user-company.html',
    controller: 'controllerCompanyEntryForm',
    controllerAs: 'uco',
    scope: {
      company: '='
    }
  };
  return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: User Entry Form
//
// -----------------------------------------------------------------------------------
function directiveUserEntryForm() {

  var directive = {
    restrict: 'E',
    templateUrl: 'modules/users/client/views/user-partials/user-user.html',
    controller: 'controllerUserEntryForm',
    controllerAs: 'uu',
    scope: {
      project: '=',
      company: '=',
      user: '='
    }
  };
  return directive;
}
