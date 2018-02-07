'use strict';
angular.module('documents')

  .directive('documentMgrAddFolder', ['$rootScope', '$uibModal', '$log', '_', 'DocumentMgrService', 'AlertService', function ($rootScope, $uibModal, $log, _, DocumentMgrService, AlertService) {
    return {
      restrict: 'A',
      scope: {
        project: '=',
        node: '='
      },
      link: function (scope, element) {
        element.on('click', function () {
          $uibModal.open({
            animation: true,
            templateUrl: 'modules/documents/client/views/document-manager-add.html',
            resolve: {},
            controllerAs: 'addFolder',
            controller: function ($scope, $uibModalInstance) {
              var self = this;

              $scope.project = scope.project;
              $scope.node = scope.node;

              self.entryText = '';
              self.title = "Add Folder to '" + $scope.node.model.name + "'";
              if ($scope.node.model.name === 'ROOT') {
                self.title = "Add Folder to '" + $scope.project.name + "'";
              }

              self.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };

              self.ok = function () {
                self.newname = self.entryText;
                //Check if there is already a folder of name ${entryText} in current directory.
                self.repeat = _.find($scope.node.children, function(element) {
                  return element.model.name.toLowerCase() === self.entryText.toLowerCase();
                });
                //If ${entryText} is a unique name for this directory, create the folder, otherwise throw an error.
                if (self.repeat) {
                  self.validationMessage = "Enter a unique name for this folder.";
                } else {
                  DocumentMgrService.addDirectory($scope.project, $scope.node, self.entryText)
                    .then(
                      function (result) {
                        $uibModalInstance.close(result.data);
                      },
                      function (err) {
                        AlertService.error("Could not add folder: " + err.data.message, 4000);
                      }
                    );
                }
              };
            }
          }).result.then(function (data) {
            $rootScope.$broadcast('documentMgrRefreshNode', { directoryStructure: data });
          })
            .catch(function (/* err */) {
            // swallow error
            });
        });
      }
    };
  }]);

