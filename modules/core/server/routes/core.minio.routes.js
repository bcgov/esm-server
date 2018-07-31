'use strict';

var policy = require('../../../core/server/controllers/core.policy.controller');
var minioController = require('../controllers/core.minio.controller');

module.exports = function (app) {
  // TODO validate if the user is allowed a presigned url or not (comment period is open, staff has permissions, etc)
  app.route('/api/getMinioPresignedPutURL/:name')
    .all(policy('guest'))
    .get(minioController.getMinioPresignedPutURL);
}
