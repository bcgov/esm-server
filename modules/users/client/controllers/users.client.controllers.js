'use strict';

angular.module('users')
// General
  .controller('controllerCompanyEntryForm', controllerCompanyEntryForm)
  .controller('controllerUserEntryForm', controllerUserEntryForm)
  .controller('controllerModalUserList', controllerModalUserList);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: company entry form
//
// -----------------------------------------------------------------------------------
controllerCompanyEntryForm.$inject = ['$scope', 'PROVINCES'];
/* @ngInject */
function controllerCompanyEntryForm($scope, PROVINCES) {
  var uco = this;
  uco.provs = PROVINCES;

  $scope.$watch('company', function(newValue) {
    if (newValue) {
      uco.proponent = newValue;
    }
  });

}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: user entry form
//
// -----------------------------------------------------------------------------------
controllerUserEntryForm.$inject = ['$scope'];
/* @ngInject */
function controllerUserEntryForm($scope) {
  var uu = this;

  $scope.$watch('user', function(newValue) {
    if (newValue) {
      uu.user = newValue;
    }
  });
  $scope.$watch('project', function(newValue) {
    if (newValue) {
      uu.project = newValue;
    }
  });
}
// -----------------------------------------------------------------------------------
//
// CONTROLLER: user entry form
//
// -----------------------------------------------------------------------------------
controllerModalUserList.$inject = ['$scope', 'rUsers'];
/* @ngInject */
function controllerModalUserList($scope, rUsers) {
  var userList = this;

  userList.users = rUsers;
}
