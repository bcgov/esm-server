'use strict';

angular.module('core')
  .factory('Minio', function (ModelBase) {
    var Minio = ModelBase.extend({
      getMinioPresignedURL: function () {
        return this.get('/api/getMinioPresignedURL');
      },
    })
    return new Minio();
  });
