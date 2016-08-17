'use strict';
var mongoose = require ('mongoose');
var EmailTemplate = mongoose.model ('EmailTemplate');
var promise = require('promise');
var _ = require('lodash');


module.exports = function () {

  var data = [];

  data.push(new EmailTemplate({
    subject : '%APP_TITLE%  - You have been invited to participate on project: %PROJECT_NAME%',
    name : 'invitation',
    code  : 'invitation',
    group : 'Invitation',
    content : '<p>Hello %TO_NAME%,</p>\n<p>Welcome to <strong>%APP_DESCRIPTION%</strong> (%APP_TITLE%).</p>\n<p>You have been invited to participate on project <strong>%PROJECT_NAME%</strong> by %CURRENT_USER_NAME% ({{%CURRENT_USER_EMAIL%}}).</p>\n<p>Please click the following link to accept the invitation to the project: <a href=\"{{%INVITATION_URL%}}\">{{%PROJECT_NAME%}}</a></p>'
  }));

  data.push(new EmailTemplate({
    subject : '%PROJECT_NAME% Content Update Notice',
    name : 'Project Update',
    code  : 'content',
    group : 'Content',
    content : '<p>%PROJECT_NAME% content has been updated.<br>Please review the following content:</p><p>%RELATED_CONTENT%</p>'
  }));

  return promise.all(data.map(function (d) {
    console.log('Email template seeding starting...');
    return new promise(function (resolve, reject) {
        // need to tweak the data for upserting...
        var upsertData = d.toObject();
        delete upsertData._id;

        EmailTemplate.findOneAndUpdate({name: d.name, code: d.code, group: d.group}, upsertData, {upsert : true, 'new' : true}, function(err, doc){
            if (err) {
              console.log('Email Template upsert failed: ' + err.toString() + ': ' + JSON.stringify(d));
              reject(new Error(err));
            } else {
              //console.log('Email Template upsert completed');
              resolve(doc);
            }
        });
      });
    }))
  .then(function () {
    console.log('Email template seeding done.');
  });
};
