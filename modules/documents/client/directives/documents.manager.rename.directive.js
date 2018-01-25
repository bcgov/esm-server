'use strict';
angular.module('documents')
  .directive('documentMgrRenameFolder', ['$rootScope', '$uibModal', '$log', '_', 'DocumentMgrService', 'AlertService', 'TreeModel', function ($rootScope, $uibModal, $log, _, DocumentMgrService, AlertService, TreeModel) {
    return {
      restrict: 'A',
      scope: {
        project: '=',
        root: '=',
        node: '='
      },
      link: function (scope, element, attrs) {
        element.on('click', function () {
          $uibModal.open({
            animation: true,
            size: 'lg',
            templateUrl: 'modules/documents/client/views/document-manager-add.html',
            resolve: {},
            controllerAs: 'addFolder',
            controller: function ($scope, $uibModalInstance) {
              var self = this;

              $scope.project = scope.project;
              $scope.node = scope.node || scope.root;

              self.entryText = '';
              self.title = "Rename Folder '" + $scope.node.model.folderObj.displayName + "'";
              if ($scope.node.model.name === 'ROOT') {
                $uibModalInstance.dismiss('cancel');
              }

              self.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };
              
              self.ok = function () {
                //Check if there is already a folder of name ${entryText} in current directory.
                var repeat = _.find($scope.node.parent.children, function(element) {
                  return element.model.name === self.entryText;
                });
                //If ${entryText} is a unique name for this directory, rename the folder, otherwise throw an error.
                if (repeat) {
                  AlertService.error(self.entryText + " already exists in this directory.");
                } else {
                  DocumentMgrService.renameDirectory($scope.project, $scope.node, self.entryText)
                  .then(
                    function (result) {
                      $uibModalInstance.close(result.data);
                    },
                    function (err) {
                      //$log.error('renameDirectory error: ', JSON.stringify(err));
                      AlertService.error("Could not rename folder");
                    }
                  );
                }
              };

            }
          }).result.then(function (data) {
            console.log("deleted data:", data);
            $rootScope.$broadcast('documentMgrRefreshNode', { directoryStructure: data });
          })
          .catch(function (err) {
            //$log.error(err);
          });
        });
      }
    };
  }])
;
