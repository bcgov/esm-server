'use strict';
var monk = require('monk');
var url = 'localhost:27017/mean-dev';
var db = monk(url);

var collection = db.get('recentactivities');

collection.find({}).each(function(recentactivity) {
  var contentUrl = recentactivity.contentUrl;
  var documentUrl = recentactivity.documentUrl;
  var id = recentactivity._id;

  if( contentUrl ) {
    recentactivity.contentUrl = recentactivity.contentUrl.replace(/https:\/\/(www.)?projects.eao.gov.bc.ca/, '');
  }

  if( documentUrl ) {
    recentactivity.documentUrl = recentactivity.documentUrl.replace(/https:\/\/(www.)?projects.eao.gov.bc.ca/, '');
  }
  id = monk.id(id);
  collection.update({_id: id }, recentactivity);
}).then(function() {
  db.close();
});
