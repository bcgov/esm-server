'use strict';

var minio = require('minio');

var commentPeriodController = require('../../../project-comments/server/controllers/commentperiod.controller');
var routes = require ('../../../core/server/controllers/core.routes.controller');
/**
 * The minio client which facilitates the connection to minio, and through which all calls should be made.
 */
var minioClient = new minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: 443,
  secure: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

/**
 * Get a minio presigned url, for a specific file object, that permits PUT operations.
 * The url can be used multiple times, but expires after 5 minutes.
 * @param bucket the minio bucket
 * @param projectCode a project code
 * @param fileName the name of the file
 * @return a promise that resolves with the presigned url
 */
var getPresignedPUTUrl = function (bucket, projectCode, fileName) {
  return minioClient.presignedPutObject(bucket, projectCode + '/' + fileName, 5 * 60)
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
 * @param bucket the minio bucket
 * @param projectCode a project code
 * @param fileName the name of the file
 */
var deleteDocument = function (bucket, projectCode, fileName) {
  return minioClient.removeObject(bucket, projectCode + '/' + fileName)
    .then(function (result, err) {
      if (err) {
        throw err;
      }
      return result;
    })
};
exports.deleteDocument = deleteDocument;

/**
 * Get a minio presigned url, for a specific file object, that permits GET operations.
 * The url can be used multiple times, but expires after 5 minutes.
 * @param filePath the file path for the file to retrieve.  Typically something like "projectCode/fileName"
 * @return a promise that resolves with the presigned url
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

/**
 * Wrappers for the above functions to add support for http request/response.
 */
var asHttpRequest = {
  /**
   * Wraps the getPresignedPUTUrl function in a promise that supports http request/response, and has additional validation for comment periods.
   * @see getPresignedPUTUrl
   */
  getPresignedAttachmentUrl: function (req, res) {
    return new Promise(function (resolve, reject) {
      return routes.setSessionContext(req)
        .then(function(options) {
          return new commentPeriodController(options).isCommentPeriodOpen(req.params.commentPeriodId)
            .then(function() {
              return getPresignedPUTUrl('uploads', req.params.projectCode, req.params.fileName);
            });
        })
        .then(
          function(result) {
            res.json(result);
          },
          function(error) {
            res.status(400).send({ message: error });
          })
        .then(resolve, reject);
    });
  },
  /**
   * Wraps the getPresignedPUTUrl function in a promise that supports http request/response.
   * @see getPresignedPUTUrl
   */
  getPresignedDocumentUrl: function (req, res) {
    return new Promise(function (resolve, reject) {
      getPresignedPUTUrl('uploads', req.params.projectCode, req.params.fileName)
        .then(
          function (result) {
            res.json(result);
          },
          function (error) {
            res.status(400).send({ message: error });
          })
        .then(resolve, reject);
    });
  },
  /**
   * Wraps the existing function of the same name in a promise that supports http request/response.
   * @see getPresignedPUTUrl
   */
  deleteDocument: function (req, res) {
    return new Promise(function (resolve, reject) {
      deleteDocument('uploads', req.params.projectCode, req.params.fileName)
        .then(
          function (result) {
            res.json(result);
          },
          function (error) {
            res.status(400).send({ message: error });
          })
        .then(resolve, reject);
    });
  }
}
exports.asHttpRequest = asHttpRequest;
