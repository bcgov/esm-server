'use strict';

angular.module('collections').factory('CollectionModel', function (ModelBase, _) {
    var Class = ModelBase.extend ({
        urlName : 'collection',

        lookupProject: function(projectCode) {
            return this.get('/api/collections/project/' + projectCode);
        },

        removeCollection: function(collectionId) {
          return this.put('/api/collections/' + collectionId + '/remove', {});
        },

        addMainDocument: function(collectionId, documentId) {
          return this.put('/api/collections/' + collectionId + '/document/' + documentId + '/main/add', {});
        },

        removeMainDocument: function(collectionId, documentId) {
          return this.put('/api/collections/' + collectionId + '/document/' + documentId + '/main/remove', {});
        },

        addOtherDocument: function(collectionId, documentId) {
          return this.put('/api/collections/' + collectionId + '/document/' + documentId + '/add', {});
        },

        removeOtherDocument: function(collectionId, documentId) {
          return this.put('/api/collections/' + collectionId + '/document/' + documentId + '/remove', {});
        },

        publishCollection: function(collectionId) {
          return this.put('/api/collections/' + collectionId + '/publish', {});
        },

        unpublishCollection: function(collectionId) {
          return this.put('/api/collections/' + collectionId + '/unpublish', {});
        },

        sortOtherDocuments: function(collectionId, idList) {
          return this.put('/api/collections/' + collectionId + '/sort', idList);
        }
    });
    return new Class ();
});
