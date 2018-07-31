'use strict';

angular.module('core').factory('MinioService', ['ModelBase', '$http', function (ModelBase, $http) {
  var MinioService = ModelBase.extend({
    getMinioPresignedPutURL: function (fileName) {
      return this.get('/api/getMinioPresignedPutURL/' + fileName);
    },
    putMinioPresignedPutURL: function (minioPresignedURL, file) {
      return $http({method: 'PUT', url: minioPresignedURL, data: file});
    },
  })
  return new MinioService();
}]);
