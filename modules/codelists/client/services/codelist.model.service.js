
'use strict';

angular.module('codelists').factory ('CodeListModel', function (ModelBase) {
  var Class = ModelBase.extend ({
    urlName : 'codelists'
  });
  return new Class ();
});


