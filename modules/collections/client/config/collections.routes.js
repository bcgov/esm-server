'use strict';

angular.module('collections').config(['$stateProvider', function($stateProvider) {
  $stateProvider

    .state('p.collection', {
      abstract: true,
      url: '/collection',
      template: '<ui-view></ui-view>',
      resolve: {
        collections: function($stateParams, CollectionModel, project) {
          return CollectionModel.lookupProject(project.code);
        },
        types: function(COLLECTION_TYPES) {
          var types = COLLECTION_TYPES;
          return types.map(function(t) {
            return { id: t, title: t };
          });
        },
      }
    })

    .state('p.collection.list', {
      url: '/list',
      templateUrl: 'modules/collections/client/views/collections-list.html',
      controller: function ($scope, NgTableParams, collections, project, types) {
        $scope.tableParams = new NgTableParams({ count: 10 },{ dataset: collections });
        $scope.project = project;
        $scope.types = types;
      }
    })

    .state('p.collection.create', {
      url: '/create',
      templateUrl: 'modules/collections/client/views/collection-edit.html',
      resolve: {
        collection: function(CollectionModel) {
          return CollectionModel.getNew();
        }
      },
      controller: function($scope, $state, project, NgTableParams, collection, types, CollectionModel, AlertService) {
        $scope.collection = collection;
        $scope.collection.project = project._id;
        $scope.project = project;
        $scope.types = types;

        $scope.save = function(isValid) {
          if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'collectionForm');
            return false;
          }
          // Update parent and status
          $scope.collection.status = 'Issued';
          switch($scope.collection.type) {
          case 'Certificate Amendment':
            $scope.collection.parentType = 'Authorizations';
            $scope.collection.status = 'Amended';
            break;

          case 'Certificate':
            $scope.collection.parentType = 'Authorizations';
            break;

          case 'Inspection Record':
            $scope.collection.parentType = 'Compliance and Enforcement';
            break;

          case 'Management Plan':
          case 'Proponent Self Report':
            $scope.collection.parentType = 'Other';
            break;
          }
          CollectionModel.add($scope.collection)
            .then(function(/* model */) {
              AlertService.success('"' + $scope.collection.displayName + '" created successfully.', 4000, true);
              $state.transitionTo('p.collection.detail', { projectid: project.code, collectionId: collection._id }, {
                reload: true, inherit: false, notify: true
              });
            })
            .catch(function(/* err */) {
              // swallow error
            });
        };
      }
    })

    .state('p.collection.detail', {
      url: '/:collectionId',
      templateUrl: 'modules/collections/client/views/collection-view.html',
      resolve: {
        collection: function($stateParams, CollectionModel) {
          return CollectionModel.getModel($stateParams.collectionId);
        }
      },
      controller: function($scope, $state, $uibModal, $location, NgTableParams, collection, project, CollectionModel, _, AlertService) {
        $scope.collection = collection;
        $scope.project = project;

        $scope.mainTableParams = new NgTableParams({ count: 1 }, { dataset: collection.mainDocument ? [ collection.mainDocument ] : [], counts: [] });
        $scope.otherTableParams = new NgTableParams({ sorting: { sortOrder: 'asc' }, count: 10 }, { dataset: collection.otherDocuments });

        $scope.linkedMainDocument = collection.mainDocument ? [ collection.mainDocument.document ] : [];
        $scope.linkedOtherDocuments = _.map(collection.otherDocuments, function(cd) { return cd.document; });

        $scope.confirmMove = function(title, msg, moveFunc) {
          var modalDocView = $uibModal.open({
            animation: true,
            templateUrl: 'modules/utils/client/views/partials/modal-confirm-generic.html',
            controller: function($scope, $state, $uibModalInstance) {
              var self = this;
              self.title = title || 'Move document?';
              self.question = msg || 'Are you sure?';
              self.actionOK = 'Move';
              self.actionCancel = 'Cancel';
              self.ok = function() {
                $uibModalInstance.close($scope.project);
              };
              self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'self',
            scope: $scope,
            size: 'md',
            windowClass: 'modal-alert',
            backdropClass: 'modal-alert-backdrop'
          });
          modalDocView.result.then(function(/* res */) {
            moveFunc();
          });
        };

        var goToList = function() {
          $state.transitionTo('p.collection.list', { projectid: project.code }, {
            reload: true, inherit: false, notify: true
          });
        };

        var reloadDetails = function() {
          $state.transitionTo('p.collection.detail', { projectid: project.code, collectionId: collection._id }, {
            reload: true, inherit: false, notify: true
          });
        };

        $scope.otherDocsReordered = function() {
          reloadDetails();
        };

        $scope.delete = function() {
          var modalView = $uibModal.open({
            animation: true,
            templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
            controller: function($scope, $state, $uibModalInstance) {
              var self = this;
              self.dialogTitle = "Delete Collection";
              self.name = $scope.collection.displayName;
              self.ok = function() {
                $uibModalInstance.close($scope.collection);
              };
              self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'self',
            scope: $scope,
            size: 'md'
          });
          modalView.result.then(function(/* res */) {
            CollectionModel.removeCollection($scope.collection._id)
              .then(function(/* res */) {
                // deleted show the message, and go to list...
                AlertService.success('"' + $scope.collection.displayName + '" was deleted successfully.', 4000, true);
                goToList();
              })
              .catch(function(/* res */) {
                // could have errors from a delete check...
                AlertService.error('"' + $scope.collection.displayName + '" was not deleted.', 4000, true);
                reloadDetails();
              });
          });
        };

        $scope.goToDocument = function(doc) {
          // Open document in doc manager.
          $location.url('/p/' + $scope.project.code + '/docs?folder=' + doc.directoryID);
        };

        $scope.updateMainDocument = function(updatedDocuments) {
          var docPromise = null;

          var moveFunc = function(movePromise) {
            if (movePromise) {
              movePromise
                .then(reloadDetails)
                .catch(function(/* res */) {
                  AlertService.error('Could not update main document for "'+ $scope.collection.displayName +'".', 4000, true);
                  reloadDetails();
                });
            }
          };

          // Check for updates
          if (collection.mainDocument && (!updatedDocuments || updatedDocuments.length === 0)) {
            // Removed main document
            docPromise = CollectionModel.removeMainDocument(collection._id, collection.mainDocument.document._id);
          } else if (updatedDocuments && updatedDocuments.length > 0) {
            // Only use the first document
            var newMainDocument = updatedDocuments[0];
            if (!collection.mainDocument || collection.mainDocument.document._id !== newMainDocument._id) {
              // Is the document in the other documents?
              var collectionDocument = _.find(collection.otherDocuments, function(cd) {
                return cd.document._id === newMainDocument._id;
              });

              if (collectionDocument) {
                $scope.confirmMove(
                  'Move Other Document?',
                  'Are you sure you want to move "' + newMainDocument.displayName + '" from Other Documents to the Main Document?',
                  function() {
                    moveFunc(CollectionModel.addMainDocument(collection._id, newMainDocument._id));
                  }
                );
              } else {
                docPromise = CollectionModel.addMainDocument(collection._id, newMainDocument._id);
              }
            }
          }

          moveFunc(docPromise);
        };

        $scope.removeMainDocument = function(document) {
          CollectionModel.removeMainDocument($scope.collection._id, document._id)
            .then(reloadDetails)
            .catch(function(/* res */) {
              AlertService.error('Could not remove main document from "'+ $scope.collection.displayName +'".', 4000, true);
              reloadDetails();
            });
        };

        $scope.updateOtherDocuments = function(updatedDocuments) {
          var originalDocuments = _.map(collection.otherDocuments, function(cd) { return cd.document; });

          // Find documents added to the collection
          var addedDocuments = _.filter(updatedDocuments, function(updatedDoc) {
            return !_.find(originalDocuments, function(originalDoc) { return originalDoc._id === updatedDoc._id; });
          });

          // Find documents removed from the collection
          var removedDocuments = _.filter(originalDocuments, function(originalDoc) {
            return !_.find(updatedDocuments, function(updatedDoc) { return updatedDoc._id === originalDoc._id; });
          });

          var docPromises = _.union(_.map(addedDocuments, function(doc) {
            return CollectionModel.addOtherDocument(collection._id, doc._id);
          }), _.map(removedDocuments, function(doc) {
            return CollectionModel.removeOtherDocument(collection._id, doc._id);
          }));

          var moveFunc = function() {
            Promise.all(docPromises)
              .then(reloadDetails)
              .catch(function(/* res */) {
                AlertService.error('Could not update other documents for "'+ $scope.collection.displayName +'".', 4000, true);
                reloadDetails();
              });
          };

          // Check if the main document has been moved
          var mainDocument = collection.mainDocument && _.find(addedDocuments, function(d) {
            return d._id === collection.mainDocument.document._id;
          });

          if (mainDocument) {
            $scope.confirmMove(
              'Move Main Document?',
              'Are you sure you want to move "' + collection.mainDocument.document.displayName + '" from the Main Document to Other Documents?',
              moveFunc
            );
          } else {
            moveFunc();
          }
        };

        $scope.removeOtherDocument = function(document) {
          CollectionModel.removeOtherDocument($scope.collection._id, document._id)
            .then(reloadDetails)
            .catch(function(/* res */) {
              AlertService.error('Could not remove other document from "'+ $scope.collection.displayName +'".', 4000, true);
              reloadDetails();
            });
        };

        $scope.confirmPublishView = function(isPublishing) {
          return $uibModal.open({
            animation: true,
            templateUrl: 'modules/utils/client/views/partials/modal-confirm-generic.html',
            controller: function($scope, $state, $uibModalInstance) {
              var self = this;
              self.title = isPublishing ? 'Publish Collection?' : 'Unpublish Collection?';
              self.question = 'Are you sure you want to ' + (isPublishing ? 'publish "' : 'unpublish "') + $scope.collection.displayName + '"?';
              self.actionOK = isPublishing ? 'Publish' : 'Unpublish';
              self.actionCancel = 'Cancel';
              self.ok = function() {
                $uibModalInstance.close($scope.project);
              };
              self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'self',
            scope: $scope,
            size: 'md',
            windowClass: 'modal-alert',
            backdropClass: 'modal-alert-backdrop'
          });
        };

        $scope.publish = function() {
          $scope.confirmPublishView(true).result.then(function() {
            return CollectionModel.publishCollection($scope.collection._id);
          })
            .then(function() {
              // published, show the message, and go to list...
              AlertService.success('"'+ $scope.collection.displayName +'"' + ' was published successfully.', 4000, true);
              goToList();
            })
            .catch(function(/* res */) {
              AlertService.error('"'+ $scope.collection.displayName +'"' + ' was not published.', 4000, true);
              reloadDetails();
            });
        };

        $scope.unpublish = function() {
          $scope.confirmPublishView(false).result.then(function() {
            return CollectionModel.unpublishCollection($scope.collection._id);
          })
            .then(function() {
              // unpublished, show the message, and go to list...
              AlertService.success('"'+ $scope.collection.displayName +'"' + ' was unpublished successfully.', 4000, true);
              goToList();
            })
            .catch(function(/* res */) {
              AlertService.error('"'+ $scope.collection.displayName +'"' + ' was not unpublished.', 4000, true);
              reloadDetails();
            });
        };
      }
    })

    .state('p.collection.edit', {
      url: '/:collectionId/edit',
      templateUrl: 'modules/collections/client/views/collection-edit.html',
      resolve: {
        collection: function($stateParams, CollectionModel) {
          return CollectionModel.getModel($stateParams.collectionId);
        }
      },
      controller: function($scope, $state, $uibModal, $location, NgTableParams, collection, project, types, CollectionModel, _, AlertService) {
        $scope.collection = collection;
        $scope.project = project;
        $scope.types = types;

        $scope.mainTableParams = new NgTableParams({ count: 1 }, { dataset: collection.mainDocument ? [ collection.mainDocument ] : [], counts: [] });
        $scope.otherTableParams = new NgTableParams({ sorting: { sortOrder: 'asc' }, count: 10 }, { dataset: collection.otherDocuments });

        $scope.linkedMainDocument = collection.mainDocument ? [ collection.mainDocument.document ] : [];
        $scope.linkedOtherDocuments = _.map(collection.otherDocuments, function(cd) { return cd.document; });

        $scope.confirmMove = function(title, msg, moveFunc) {
          var modalDocView = $uibModal.open({
            animation: true,
            templateUrl: 'modules/utils/client/views/partials/modal-confirm-generic.html',
            controller: function($scope, $state, $uibModalInstance) {
              var self = this;
              self.title = title || 'Move document?';
              self.question = msg || 'Are you sure?';
              self.actionOK = 'Move';
              self.actionCancel = 'Cancel';
              self.ok = function() {
                $uibModalInstance.close($scope.project);
              };
              self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'self',
            scope: $scope,
            size: 'md',
            windowClass: 'modal-alert',
            backdropClass: 'modal-alert-backdrop'
          });
          modalDocView.result.then(function(/* res */) {
            moveFunc();
          });
        };

        var goToList = function() {
          $state.transitionTo('p.collection.list', { projectid: project.code }, {
            reload: true, inherit: false, notify: true
          });
        };

        var goToDetail = function() {
          $state.transitionTo('p.collection.detail', { projectid: project.code, collectionId: collection._id }, {
            reload: true, inherit: false, notify: true
          });
        };

        var reloadEdit = function() {
          // want to reload this screen, do not catch unsaved changes (we are probably in the middle of saving).
          $scope.allowTransition = true;
          $state.reload();
        };

        $scope.otherDocsReordered = function() {
          reloadEdit();
        };

        $scope.goToDocument = function(doc) {
          // Open document in doc manager.
          $location.url('/p/' + $scope.project.code + '/docs?folder=' + doc.directoryID);
        };

        $scope.updateMainDocument = function(updatedDocuments) {
          var docPromise = null;

          var moveFunc = function(movePromise) {
            if (movePromise) {
              movePromise
                .then(reloadEdit)
                .catch(function(/* res */) {
                  AlertService.error('Could not update main document for "'+ $scope.collection.displayName +'".', 4000, true);
                  reloadEdit();
                });
            }
          };

          // Check for updates
          if (collection.mainDocument && (!updatedDocuments || updatedDocuments.length === 0)) {
            // Removed main document
            docPromise = CollectionModel.removeMainDocument(collection._id, collection.mainDocument.document._id);
          } else if (updatedDocuments && updatedDocuments.length > 0) {
            // Only use the first document
            var newMainDocument = updatedDocuments[0];
            if (!collection.mainDocument || collection.mainDocument.document._id !== newMainDocument._id) {
              // Is the document in the other documents?
              var collectionDocument = _.find(collection.otherDocuments, function(cd) {
                return cd.document._id === newMainDocument._id;
              });

              if (collectionDocument) {
                $scope.confirmMove(
                  'Move Other Document?',
                  'Are you sure you want to move "' + newMainDocument.displayName + '" from Other Documents to the Main Document?',
                  function() {
                    moveFunc(CollectionModel.addMainDocument(collection._id, newMainDocument._id));
                  }
                );
              } else {
                docPromise = CollectionModel.addMainDocument(collection._id, newMainDocument._id);
              }
            }
          }

          moveFunc(docPromise);
        };

        $scope.removeMainDocument = function(document) {
          CollectionModel.removeMainDocument($scope.collection._id, document._id)
            .then(reloadEdit)
            .catch(function(/* res */) {
              AlertService.error('Could not remove main document from "'+ $scope.collection.displayName +'".', 4000, true);
              reloadEdit();
            });
        };

        $scope.updateOtherDocuments = function(updatedDocuments) {
          var originalDocuments = _.map(collection.otherDocuments, function(cd) { return cd.document; });

          // Find documents added to the collection
          var addedDocuments = _.filter(updatedDocuments, function(updatedDoc) {
            return !_.find(originalDocuments, function(originalDoc) { return originalDoc._id === updatedDoc._id; });
          });

          // Find documents removed from the collection
          var removedDocuments = _.filter(originalDocuments, function(originalDoc) {
            return !_.find(updatedDocuments, function(updatedDoc) { return updatedDoc._id === originalDoc._id; });
          });

          var docPromises = _.union(_.map(addedDocuments, function(doc) {
            return CollectionModel.addOtherDocument(collection._id, doc._id);
          }), _.map(removedDocuments, function(doc) {
            return CollectionModel.removeOtherDocument(collection._id, doc._id);
          }));

          var moveFunc = function() {
            Promise.all(docPromises)
              .then(reloadEdit)
              .catch(function(/* res */) {
                AlertService.error('Could not update other documents for "'+ $scope.collection.displayName +'".', 4000, true);
                reloadEdit();
              });
          };

          // Check if the main document has been moved
          var mainDocument = collection.mainDocument && _.find(addedDocuments, function(d) {
            return d._id === collection.mainDocument.document._id;
          });

          if (mainDocument) {
            $scope.confirmMove(
              'Move Main Document?',
              'Are you sure you want to move "' + collection.mainDocument.document.displayName + '" from the Main Document to Other Documents?',
              moveFunc
            );
          } else {
            moveFunc();
          }
        };

        $scope.removeOtherDocument = function(document) {
          CollectionModel.removeOtherDocument($scope.collection._id, document._id)
            .then(reloadEdit)
            .catch(function(/* res */) {
              AlertService.error('Could not remove other document from "'+ $scope.collection.displayName +'".', 4000, true);
              reloadEdit();
            });
        };

        $scope.delete = function() {
          var modalView = $uibModal.open({
            animation: true,
            templateUrl: 'modules/utils/client/views/partials/modal-confirm-delete.html',
            controller: function($scope, $state, $uibModalInstance) {
              var self = this;
              self.dialogTitle = "Delete Collection";
              self.name = $scope.collection.displayName;
              self.ok = function() {
                $uibModalInstance.close($scope.collection);
              };
              self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'self',
            scope: $scope,
            size: 'md'
          });
          modalView.result.then(function(/* res */) {
            CollectionModel.deleteId($scope.collection._id)
              .then(function(/* res */) {
                // deleted show the message, and go to list...
                AlertService.success('"'+ $scope.collection.displayName +'"' + ' was deleted successfully.', 4000, true);
                goToList();
              })
              .catch(function(/* res */) {
                // could have errors from a delete check...
                AlertService.error('"'+ $scope.collection.displayName +'"' + ' was not deleted.', 4000, true);
                reloadEdit();
              });
          });
        };

        $scope.confirmPublishView = function(isPublishing) {
          return $uibModal.open({
            animation: true,
            templateUrl: 'modules/utils/client/views/partials/modal-confirm-generic.html',
            controller: function($scope, $state, $uibModalInstance) {
              var self = this;
              self.title = isPublishing ? 'Publish Collection?' : 'Unpublish Collection?';
              self.question = 'Are you sure you want to ' + (isPublishing ? 'publish "' : 'unpublish "') + $scope.collection.displayName + '"?';
              self.actionOK = isPublishing ? 'Publish' : 'Unpublish';
              self.actionCancel = 'Cancel';
              self.ok = function() {
                $uibModalInstance.close($scope.project);
              };
              self.cancel = function() {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'self',
            scope: $scope,
            size: 'md',
            windowClass: 'modal-alert',
            backdropClass: 'modal-alert-backdrop'
          });
        };

        $scope.publish = function() {
          $scope.confirmPublishView(true).result.then(function() {
            return CollectionModel.publishCollection($scope.collection._id);
          })
            .then(function() {
              // published, show the message, and go to list...
              AlertService.success('"'+ $scope.collection.displayName +'"' + ' was published successfully.', 4000, true);
              goToDetail();
            })
            .catch(function(/* res */) {
              AlertService.error('"'+ $scope.collection.displayName +'"' + ' was not published.', 4000, true);
              reloadEdit();
            });
        };

        $scope.unpublish = function() {
          $scope.confirmPublishView(false).result.then(function() {
            return CollectionModel.unpublishCollection($scope.collection._id);
          })
            .then(function() {
              // unpublished, show the message, and go to list...
              AlertService.success('"'+ $scope.collection.displayName +'"' + ' was unpublished successfully.', 4000, true);
              goToDetail();
            })
            .catch(function(/* res */) {
              AlertService.error('"'+ $scope.collection.displayName +'"' + ' was not unpublished.', 4000, true);
              reloadEdit();
            });
        };

        $scope.save = function(isValid) {
          if (!isValid) {
            $scope.$broadcast('show-errors-check-validity', 'collectionForm');
            return false;
          }
          // Update parent and status
          $scope.collection.status = 'Issued';
          switch($scope.collection.type) {
          case 'Certificate Amendment':
            $scope.collection.parentType = 'Authorizations';
            $scope.collection.status = 'Amended';
            break;

          case 'Certificate':
            $scope.collection.parentType = 'Authorizations';
            break;

          case 'Inspection Record':
            $scope.collection.parentType = 'Compliance and Enforcement';
            break;

          case 'Management Plan':
          case 'Proponent Self Report':
            $scope.collection.parentType = 'Other';
            break;
          }
          CollectionModel.save($scope.collection)
            .then(function (/* model */) {
              goToDetail();
            })
            .catch(function(/* err */) {
              // swallow error
            });
        };
      }
    });
}]);
