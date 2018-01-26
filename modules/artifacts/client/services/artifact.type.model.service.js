'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('artifacts').factory ('ArtifactTypeModel', function (ModelBase) {
  //
  // build the model by extending the base model. the base model will
  // have all the basic crud stuff built in
  //
  var Class = ModelBase.extend ({
    urlName : 'artifacttype',
    templateTypes: function () {
      return this.get ('/api/artifacttype/template/types');
    },
    fromCode: function (code) {
      return this.get ('/api/artifacttype/code/'+code);
    }
  });
  return new Class ();
});


