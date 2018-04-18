'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/auth/forgot', $scope.credentials).then(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.data.message;

      }, function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.data.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).then(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response.data;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);
