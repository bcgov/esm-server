'use strict';

var minio = require('minio');

/**
 * The minio client which facilitates the connection to minio, and through which all calls should be made.
 */
var minioClient = new minio.Client({
  endPoint: process.env.MINIO_HOST || 'minio-esm-emiliano-esm-dev.pathfinder.gov.bc.ca',
  secure: true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'xET8WHv5Bemb',
  secretKey: process.env.MINIO_SECRET_KEY || '1mgTwu4IkVwRL6T2'
});

/**
 * Get a minio presigned url, for a specific file object, that permits PUT operations.
 * The url can be used multiple times, but expires after 5 minutes.
 * @param projectCode a project code
 * @param fileName the name of the file
 * @return an promise that resolves with the presigned url
 */
var getPresignedPUTUrl = function (projectCode, fileName) {
  return minioClient.presignedPutObject('uploads', projectCode + '/' + fileName, 5 * 60)
    .then(function (url, err) {
      if (err) {
        throw err
      }
      return url;
    })
};
exports.getPresignedPUTUrl = getPresignedPUTUrl;


/**
 * Delete a file from minio.
 * @param projectCode a project code
 * @param fileName the name of the file
 */
var deleteDocument = function (projectCode, fileName) {
  return minioClient.removeObject('uploads', projectCode + '/' + fileName)
    .then(function (result, err) {
      if (err) {
        throw err;
      }
      return result;
    })
};
exports.deleteDocument = deleteDocument;

/**
 * Upload a file using a minio presigned PUT url.
 * @param minioPresignedURL a minio presigned put url
 * @param file a file object
 * @param progressCallback a callback function that will be called periodically with an http progress event.
 */
var getPresignedGETUrl = function (filePath) {
  return minioClient.presignedGetObject('uploads', filePath, 5 * 60)
    .then(function (url, err) {
      if (err) {
        throw err;
      }
      return url;
    });
};
exports.getPresignedGETUrl = getPresignedGETUrl;

var asHttpRequest = {
  /**
   * Wraps the existing function of the same name in a promise that supports http request/response.
   * @see getPresignedPUTUrl
   */
  getPresignedPUTUrl: function (req, res) {
    return new Promise(function (resolve, reject) {
      getPresignedPUTUrl(req.params.projectCode, req.params.fileName)
        .then(
          function (result) {
            res.json(result);
          },
          function (error) {
            res.status(400).send({
              message: error
            });
          }
        ).then(resolve, reject);
    });
  },
  /**
   * Wraps the existing function of the same name in a promise that supports http request/response.
   * @see getPresignedPUTUrl
   */
  deleteDocument: function (req, res) {
    return new Promise(function (resolve, reject) {
      deleteDocument(req.params.projectCode, req.params.fileName)
        .then(
          function (result) {
            res.json(result);
          },
          function (error) {
            res.status(400).send({
              message: error
            });
          }
        )
        .then(resolve, reject);
    });
  }
}
exports.asHttpRequest = asHttpRequest;
