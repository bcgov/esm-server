'use strict';

var policy = require('../../../core/server/controllers/core.policy.controller');
var minioController = require('../controllers/core.minio.controller');

module.exports = function (app) {
  /**
   * Delete a file from minio.
   * @return a promise that resolves with an http response
   */
  app.route('/api/deleteMinioDocument/:projectCode/:fileName')
    .all(policy('user'))
    .delete(minioController.asHttpRequest.deleteDocument);
}
