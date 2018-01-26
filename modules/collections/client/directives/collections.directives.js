'use strict';

angular.module('control')
  .directive('collectionChooser', directiveCollectionsChooser);

directiveCollectionsChooser.$inject = ['CollectionModel', '$uibModal', '_'];

function directiveCollectionsChooser(CollectionModel, $uibModal, _) {
  return {
    restrict: 'A',
    scope: {
      project: '=',
      docs: '=',
      current: '=',
      onOk: '=',
      onUpdate: '='
    },
    link : function(scope, element) {
      element.on('click', function() {
        $uibModal.open ({
          animation: true,
          templateUrl: 'modules/collections/client/views/collections-select.html',
          controllerAs: 's',
          size: 'lg',
          resolve: {
            collections: function(CollectionModel) {
              return CollectionModel.lookupProject(scope.project.code);
            }
          },
          controller: function($scope, $uibModalInstance, collections) {
            var s = this;

            s.items = collections;
            s.selected = [];

            s.multiple = _.isArray(scope.docs);

            s.isSelected = function(id) {
              var item = _.find(s.selected, function(o) { return o._id === id; });
              return !_.isEmpty(item);
            };

            s.select = function(id) {
              var item = _.find(s.selected, function(o) { return o._id === id; });
              if (item) {
                _.remove(s.selected, function(o) { return o._id === id; });
              } else {
                var existingItem = _.find(s.items, function(o) { return o._id === id; });
                if (!_.isEmpty(existingItem)) {
                  s.selected.push(existingItem);
                }
              }
            };

            s.cancel = function() { $uibModalInstance.dismiss('cancel'); };

            s.ok = function() {
              $uibModalInstance.close(s.selected);
            };

            // if current, then we need to select
            if (scope.current) {
              _.forEach(scope.current, function(o) {
                s.select(o._id);
              });
            }
          }
        }).result.then(function(collections) {
          if (scope.onOk) {
            scope.onOk(collections, scope.docs)
              .then(function() {
                // on ok, we refresh the document and its info panel here
                if (scope.onUpdate) {
                  var theDocument;
                  if (_.isArray(scope.docs)) {
                    theDocument = scope.docs[0];
                  } else {
                    theDocument = scope.docs;
                  }
                  scope.onUpdate(theDocument);
                }
              });
          }
        })
          .catch (function(/* err */) {
            // swallow error
          });
      });
    }
  };
}
