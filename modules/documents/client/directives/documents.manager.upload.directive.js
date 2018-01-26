'use strict';
angular.module('documents')
  .directive('documentMgrUploadModal',['$rootScope', '$uibModal', '$log', '$timeout', '_', 'DocumentsUploadService', 'DocumentMgrService', 'DnDBackgroundBlockService',
    function ($rootScope, $uibModal, $log, $timeout, _, DocumentsUploadService, DocumentMgrService, DnDBackgroundBlockService){
      return {
        restrict: 'A',
        scope: {
          project: '=',
          root: '=',
          node: '=',
          type: '=',
          parentId: '='
        },
        link: function (scope, element) {
          DnDBackgroundBlockService.addEventListeners();
          element.on('click', function () {
            $uibModal.open({
              animation: true,
              size: 'lg',
              templateUrl: 'modules/documents/client/views/document-manager-upload-modal.html',
              resolve: {},
              backdrop: 'static',
              controllerAs: 'uploadModal',
              controller: function ($rootScope, $scope, $uibModalInstance) {
                var self = this;

                $scope.uploadService = DocumentsUploadService;
                $scope.uploadService.reset(); // just in case... want the upload service to be cleared

                $scope.project = scope.project;
                $scope.node = scope.node || scope.root;

                self.rootNode = scope.root;
                self.selectedNode = scope.node;
                self.type = scope.type;
                self.parentId = scope.parentId;

                self.title = "Upload Files to '" + self.selectedNode.model.name + "'";
                if (self.selectedNode.model.name === 'ROOT') {
                  self.title = "Upload Files to '" + $scope.project.name + "'";
                }

                var getTargetUrl = function(type) {
                  var t = type || 'project';
                  // determine URL for upload, default to project if none set.
                  if (t === 'comment' && self.parentId) {
                    return '/api/commentdocument/publiccomment/' + self.parentId + '/upload';
                  }
                  if (t === 'project' && $scope.project) {
                    return '/api/document/' + $scope.project._id + '/upload';
                  }
                };

                self.cancel = function () {
                  $scope.uploadService.reset();
                  $uibModalInstance.dismiss('cancel');
                };

                self.startUploads = function () {
                  DocumentsUploadService.startUploads(getTargetUrl(self.type), self.selectedNode.model.id, false, new Date());
                };

                $scope.$watch(function ($scope) {
                  return $scope.uploadService.actions.completed;
                },
                function (completed) {
                  if (completed) {
                    $rootScope.$broadcast('documentMgrRefreshNode', {nodeId: self.selectedNode.model.id});
                  }
                }
                );

              }
            }).result.then(function (/* data */) {
              DnDBackgroundBlockService.removeEventListeners();
            })
              .catch(function (/* err */) {
                DnDBackgroundBlockService.removeEventListeners();
              });
          });
        }
      };

    }])
  .directive('documentMgrUpload', ['$rootScope', '$timeout', '$log', 'Upload', '_', 'DocumentsUploadService', 'DocumentMgrService', 'Document', function ($rootScope, $timeout, $log, Upload, _, DocumentsUploadService) {
    return {
      restrict: 'E',
      scope: {
        project: '=',
        root: '=',
        node: '='
      },
      templateUrl: 'modules/documents/client/views/document-manager-upload.html',
      controller: function ($rootScope, $scope, $timeout, $log, Upload, _) {
        var self = this;

        $scope.uploadService = DocumentsUploadService;

        $scope.project = $scope.project;
        $scope.node = $scope.node || $scope.root;

        self.rootNode = $scope.root;
        self.selectedNode = $scope.node;

        $scope.$watch('files', function (newValue) {
          if (newValue) {
            _.each(newValue, function(file) {
              $scope.uploadService.addFile(file);
            });
          }
        });

      },
      controllerAs: 'documentMgrUpload'
    };
  }]);

