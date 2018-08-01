'use strict';

var minio = require('minio');

var minioClient = new minio.Client({
  endPoint: 'minio-esm-emiliano-esm-dev.pathfinder.gov.bc.ca',
  // port: 9000,
  secure: true,
  accessKey: 'xET8WHv5Bemb',
  secretKey: '1mgTwu4IkVwRL6T2'
});

var getMinioPresignedPutURL = function (req, res) {
  return new Promise(function (resolve, reject) {
    var objectName = req.params.projectCode + '/' + req.params.fileName;
    minioClient.presignedPutObject('uploads', objectName, 300)
      .then(function (url, err) {
        if (err) {
          reject(err);
        }
        resolve(url);
      })
  }).then(
    function (result) {
      res.json(result);
    },
    function (error) {
      res.status(400).send({
        message: error
      });
    }
  );
};
exports.getMinioPresignedPutURL = getMinioPresignedPutURL;

var removeMinioDocument = function (req, res) {
  return new Promise(function (resolve, reject) {
    minioClient.removeObject('uploads', req.params.name)
      .then(function (result, err) {
        if (err) {
          reject(err);
        }
        resolve(result);
      })
  }).then(
    function (result) {
      res.json(result);
    },
    function (error) {
      res.status(400).send({
        message: error
      });
    }
  );
};
exports.removeMinioDocument = removeMinioDocument;
