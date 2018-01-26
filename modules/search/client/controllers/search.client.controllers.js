'use strict';

angular.module('search')
  .controller('controllerModalSearchInstructions', controllerModalSearchInstructions);

// -----------------------------------------------------------------------------------
//
// CONTROLLER: Modal: View Instructions for Search Page
//
// -----------------------------------------------------------------------------------
controllerModalSearchInstructions.$inject = ['$uibModalInstance'];
/* @ngInject */
function controllerModalSearchInstructions($uibModalInstance) {
  var modal = this;

  modal.continue = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
