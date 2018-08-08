'use strict';

var policy = require('../../../core/server/controllers/core.policy.controller');
var minioController = require('../controllers/core.minio.controller');

module.exports = function (app) {
  /**
   * Get a minio presigned url, for a specific file object, that permits PUT operations.
   * The url can be used multiple times, but expires after 5 minutes.
   * @return a promise that resolves with an http response containing the presigned url
   */
  app.route('/api/getMinioCommentAttachmentUploadUrl/:projectCode/:commentPeriodId/:fileName')
    .all(policy('guest'))
    .get(minioController.asHttpRequest.getPresignedAttachmentUrl);
  /**
   * Get a minio presigned url, for a specific file object, that permits PUT operations.
   * The url can be used multiple times, but expires after 5 minutes.
   * @return a promise that resolves with an http response containing the presigned url
   */
  app.route('/api/getMinioDocumentUploadUrl/:projectCode/:fileName')
    .all(policy('user'))
    .get(minioController.asHttpRequest.getPresignedDocumentUrl);
  /**
   * Delete a file from minio.
   * @return a promise that resolves with an http response
   */
  app.route('/api/deleteMinioDocument/:projectCode/:fileName')
    .all(policy('user'))
    .delete(minioController.asHttpRequest.deleteDocument);
}
