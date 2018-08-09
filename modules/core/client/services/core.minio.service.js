'use strict';

angular.module('core').factory('MinioService', ['ModelBase', '$http', function (ModelBase, $http) {
  var MinioService = ModelBase.extend({
    /**
     * Delete a file from minio.
     * @param projectCode a project code
     * @param fileName the name of the file
     * @return a promise that resolves with an http response
     */
    deleteMinioDocument: function (projectCode, fileName) {
      return this.delete('/api/deleteMinioDocument/' + projectCode + '/' + fileName);
    }
  })
  return new MinioService();
}]);
