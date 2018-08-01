'use strict';

var minio = require('minio');

var minioClient = new minio.Client({
  endPoint: process.env.MINIO_HOST || 'minio-esm-emiliano-esm-dev.pathfinder.gov.bc.ca',
  secure: true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'xET8WHv5Bemb',
  secretKey: process.env.MINIO_SECRET_KEY || '1mgTwu4IkVwRL6T2'
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

var getMinioDocumentURL = function (filePath) {
  return minioClient.presignedGetObject('uploads', filePath, 5*60)
    .then(function (url, err) {
      if (err) {
        throw err;
      }
      return url;
    });
};
exports.getMinioDocumentURL = getMinioDocumentURL;
