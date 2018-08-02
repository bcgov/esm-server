'use strict';

angular.module('core').factory('MinioService', ['ModelBase', '$http', function (ModelBase, $http) {
  var MinioService = ModelBase.extend({
    /**
     * Get a minio presigned url, for a specific file object, that permits PUT operations.
     * The url can be used multiple times, but expires after 5 minutes.
     * @param projectCode a project code
     * @param fileName the name of the file
     * @return a promise that resolves with the presigned url
     */
    getPresignedPUTUrl: function (projectCode, fileName) {
      return this.get('/api/getMinioPresignedPUTUrl/' + projectCode + '/' + fileName);
    },
    /**
     * Upload a file using a minio presigned PUT url.
     * @param minioPresignedURL a minio presigned put url
     * @param file a file object
     * @param progressCallback a callback function that will be called periodically with an http progress event.
     */
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
    /**
     * Delete a file from minio.
     * @param projectCode a project code
     * @param fileName the name of the file
     */
    deleteDocument: function (projectCode, fileName) {
      return this.delete('/api/deleteMinioDocument/' + projectCode + '/' + fileName);
    }
  })
  return new MinioService();
}]);
