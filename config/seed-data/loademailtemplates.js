'use strict';
var mongoose = require ('mongoose');
var EmailTemplate = mongoose.model ('EmailTemplate');


module.exports = function () {
  //Add Invitation Email Template
  EmailTemplate.find({name: 'invitation'}, function (err, templates) {
    if (templates.length === 0) {
      var item = new EmailTemplate ({
        subject    : '{{appTitle}}  - You have been invited to participate on project: {{projectName}}',
        name : 'invitation',
        code : 'invitation',
        group : 'invitation',
        content : '<p>Hello {{toDisplayName}},</p>\n<p>Welcome to <strong>{{appDescription}}</strong> ({{appTitle}}).</p>\n<p>You have been invited to participate on project <strong>{{projectName}}</strong> by {{fromDisplayName}} ({{fromEmail}}).</p>\n<p>Please click the following link to accept the invitation to the project: <a href=\"{{invitationUrl}}\">{{projectTitle}}</a></p>'
      });
      // Then save the user
      item.save(function (err, model) {
        if (err) {
          console.log('Failed to add invitation email template', err);
        } else {
          console.log('Added invitation email template');
        }
      });
    } else {
      console.log('invitation email template exists');
    }
  });
};
