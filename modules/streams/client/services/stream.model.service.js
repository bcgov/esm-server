'use strict';
// =========================================================================
//
// stream model
//
// =========================================================================
angular.module('project').factory ('StreamModel', function (ModelBase) {
  //
  // build the project model by extending the base model. the base model will
  // have all the basic crud stuff built in
  //
  var StreamClass = ModelBase.extend ({
    urlName : 'stream'
  });
  return new StreamClass ();
});


