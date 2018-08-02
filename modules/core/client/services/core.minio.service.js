'use strict';

angular.module('core').factory('MinioService', ['ModelBase', '$http', function (ModelBase, $http) {
  var MinioService = ModelBase.extend({
    getPresignedPUTUrl: function (projectCode, fileName) {
      return this.get('/api/getMinioPresignedPUTUrl/' + projectCode + '/' + fileName);
    },
    putDocument: function (minioPresignedURL, file, progressCallback) {
      return $http({
        method: 'PUT',
        url: minioPresignedURL,
        data: file,
        headers: {
          "Content-Type": file.mimetype
        },
        uploadEventHandlers: {
          progress: progressCallback
        }
      });
    },
    deleteDocument: function (projectCode, fileName) {
      return this.delete('/api/deleteMinioDocument/' + projectCode + '/' + fileName);
    }
  })
  return new MinioService();
}]);
