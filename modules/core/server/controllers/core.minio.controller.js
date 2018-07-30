'use strict';

var minio = require('minio');

var minioClient = new minio.Client({
  endPoint: 'minio-esm-emiliano-esm-dev.pathfinder.gov.bc.ca',
  // port: 9000,
  secure: true,
  accessKey: 'xET8WHv5Bemb',
  secretKey: '1mgTwu4IkVwRL6T2'
});

var getMinioPresignedURL = function (req) {
  return new Promise(function (resolve, reject) {
    minioClient.presignedPutObject('uploads', req.query.name, function (err, url) {
      if (err) {
        reject(err);
      }
      resolve(url);
    })
  })
};

exports.getMinioPresignedURL = getMinioPresignedURL;
