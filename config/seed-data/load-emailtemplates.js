'use strict';
var mongoose = require ('mongoose');
var EmailTemplate = mongoose.model ('EmailTemplate');
var promise = require('promise');
var _ = require('lodash');


module.exports = function () {

  var data = [];

  data.push(new EmailTemplate({
    subject : '%APP_NAME%  - You have been invited to participate on project: %PROJECT_NAME%',
    name : 'Invitation',
    code  : 'invitation',
    group : 'Invitation',
    content : '<p>Hello %TO_NAME%,</p>\n<p>Welcome to <strong>%APP_NAME%</strong>.</p>\n<p>You have been invited to participate on project <strong>%PROJECT_NAME%</strong> by %CURRENT_USER_NAME% (%CURRENT_USER_EMAIL%).</p>\n<p>Please click the following link to accept the invitation to the project: %INVITATION_URL%</p>'
  }));

  data.push(new EmailTemplate({
    subject : '%APP_NAME% - %PROJECT_NAME% Content Update Notice',
    name : 'Project Update',
    code  : 'content',
    group : 'Content',
    content : '<p>%PROJECT_NAME% content has been updated.<br>Please review the following content:</p><p>%RELATED_CONTENT%</p>'
  }));

  console.log('Email template seeding starting...');
  return promise.all(data.map(function (d) {
    return new promise(function (resolve, reject) {
        // need to tweak the data for upserting...
        var upsertData = d.toObject();
        delete upsertData._id;
        // use case insensitive searches... more reliable.
        EmailTemplate.findOneAndUpdate({name: { $regex : new RegExp(d.name, "i") }, code: { $regex : new RegExp(d.code, "i") }, group: { $regex : new RegExp(d.group, "i") }}, upsertData, {upsert : true, 'new' : true}, function(err, doc){
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
