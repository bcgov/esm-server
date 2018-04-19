'use strict';
var monk = require('monk');
var url = 'localhost:27017/mean-dev';
var db = monk(url);

var collection = db.get('recentactivities');

collection.find({}).each(function(recentactivity) {
  var contentUrl = recentactivity.contentUrl;
  var documentUrl = recentactivity.documentUrl;
  var id = recentactivity._id;

  if( !contentUrl && !documentUrl ) {
    recentactivity.contentUrl = contentUrl;
    recentactivity.documentUrl = documentUrl;
  }

  if( contentUrl ) {
    if(contentUrl.includes('https://projects.eao.gov.bc.ca')) {
      recentactivity.contentUrl = contentUrl.substring(30, contentUrl.length);
    }
    else if(contentUrl.includes('https://www.projects.eao.gov.bc.ca')) {
      recentactivity.contentUrl = contentUrl.substring(33, contentUrl.length);
    }
    else {
      recentactivity.contentUrl = contentUrl;
    }
  }

  if( documentUrl ) {
    if(documentUrl.includes('https://projects.eao.gov.bc.ca')) {
      recentactivity.documentUrl = documentUrl.substring(30, documentUrl.length);
    }
    else if(documentUrl.includes('https://www.projects.eao.gov.bc.ca')) {
      recentactivity.documentUrl = documentUrl.substring(33, documentUrl.length);
    }
    else {
      recentactivity.documentUrl = documentUrl;
    }
  }
  id = monk.id(id);
  collection.update({_id: id }, recentactivity);
}).then(function() {
  db.close();
});
