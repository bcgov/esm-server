'use strict';

angular.module('core').factory('MinioService', ['ModelBase', '$http', function (ModelBase, $http) {
  var MinioService = ModelBase.extend({
    getMinioPresignedPutURL: function (projectCode, fileName) {
      return this.get('/api/getMinioPresignedPutURL/' + projectCode + '/' +fileName);
    },
    putMinioPresignedPutURL: function (minioPresignedURL, file) {
      return $http({method: 'PUT', url: minioPresignedURL, data: file});
    },
    removeDocument: function (fileName) {
      return this.get('/api/removeMinioDocument/' + fileName);
    }
  })
  return new MinioService();
}]);
