'use strict';

var _ = require ('lodash'),
  path = require('path'),
  config = require(path.resolve('./config/config')),
  nodemailer = require('nodemailer'),
  transporter = nodemailer.createTransport(config.mailer.options);

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  EmailTemplate = mongoose.model('EmailTemplate');

var getUsers = function(q) {
  return new Promise(function (fulfill, reject) {
    User.find(q).exec(function (err, users) {
      if (err) {
        reject(err);
      } else if (!users) {
        reject(new Error('Failed to get Users'));
      } else {
        fulfill(users);
      }
    });
  });
};

var getTemplate = function(q) {
  return new Promise(function (fulfill, reject) {
    EmailTemplate.findOne(q).exec(function (err, t) {
      if (err) {
        reject(err);
      } else if (!t) {
        reject(new Error('Failed to get Email Template'));
      } else {
        fulfill(t);
      }
    });
  });
};

var fetchUsers = function(users) {
  var valueArray = _.isArray(users) ? users : [users];
  var q = {'_id': {$in: valueArray}};

  if (typeof valueArray[0] === 'string') {
    if (mongoose.Types.ObjectId.isValid(valueArray[0])) {
      //
    } else {
      if (valueArray[0].indexOf('@') === -1) {
        q = {'username': {$in: valueArray}};
      } else {
        q = {'email': {$in: valueArray}};
      }
    }
  } else {
    // assume user objects, but don't know what properties are loaded... so make into string array of ids and load what we want.
    valueArray = valueArray.map(function(u) {
      return u._id.toString();
    });
  }
  return getUsers(q);
};


var fetchTemplate = function(template) {
  var q = {'_id': template};

  if (typeof template === 'string') {
    if (mongoose.Types.ObjectId.isValid(template)) {
      //
    } else {
      q = {'name': template};
    }
  } else {
    q = {'_id': template._id.toString()};
  }
  return getTemplate(q);
};

var recipient = function(user) {
  if (process.env.NODE_ENV === 'development') {
    // just do this in case we want to review that we are sending to the correct user/contact
    var n = user.email.split('@', 1)[0];
    return _.isEmpty(n) ? 'eao.invitee.2016@gmail.com' : 'eao.invitee.2016+' + n + '@gmail.com';
  }
  return user.email;
};

var doSendEmail = function(subject, body, fromUser, toUser) {
  return new Promise(function(fulfill, reject) {
    var mailOptions = {
      to: recipient(toUser),
      from: config.mailer.from,
      subject: subject,
      text: body,
      html: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(new Error(error.toString()));
      } else {
        fulfill(info);
      }
    });

  });
};


var doSendTemplate = function(template, data, fromUser, toUser) {
  return new Promise(function(fulfill, reject) {
    var mailOptions = {
      to: recipient(toUser)
    };

    var templateData;
    if (typeof data === 'string') {
      templateData = JSON.parse(data);
    } else {
      templateData = data;
    }

    templateData = _.assign(templateData, {
      fromEmail: fromUser.email,
      fromDisplayName: fromUser.displayName,
      toEmail: toUser.email,
      toDisplayName: toUser.displayName});


    var emailSender = transporter.templateSender({
      subject: 'Subject',
      text: template.text,
      html: template.content
    }, {
      from: config.mailer.from,
    });

    emailSender(mailOptions, templateData, function (error, info) {
      if (error) {
        reject(new Error(error.toString()));
      } else {
        fulfill(info);
      }
    });

  });
};


var doPopulateAndSend = function(subject, content, data, fromUser, toUser) {
  return new Promise(function(fulfill, reject) {
    var mailOptions = {
      to: recipient(toUser)
    };

    var templateData;
    if (typeof data === 'string') {
      templateData = JSON.parse(data);
    } else {
      templateData = data;
    }

    templateData = _.assign(templateData, {
      fromEmail: fromUser.email,
      fromDisplayName: fromUser.displayName
    });

    var emailSender = transporter.templateSender({
      subject: subject,
      text: content,
      html: content
    }, {
      from: config.mailer.from,
    });

    emailSender(mailOptions, templateData, function (error, info) {
      if (error) {
        reject(new Error(error.toString()));
      } else {
        fulfill({userId: toUser._id.toString(), email: toUser.email, accepted: _.includes(info.accepted, recipient(toUser)), rejected: _.includes(info.rejected, recipient(toUser)), messageId: info.messageId });
      }
    });

  });
};

var sendEmail = function(subject, body, from, to) {
  var sender, recipients;

  return fetchUsers(from)
    .then(function(data) {
      sender = data[0];
      return fetchUsers(to);
    })
    .then(function(data) {
      recipients = data;
      var a = recipients.map(function(to) {
        return doSendEmail(subject, body, sender, to);
      });
      return Promise.all(a);
    });
};

var sendTemplate = function(template, data, from, to) {
  var sender, recipients, emailTemplate;

  return fetchUsers(from)
    .then(function(f) {
      sender = f[0];
      return fetchUsers(to);
    })
    .then(function(r) {
      recipients = r;
      return fetchTemplate(template);
    }).then(function(t) {
      emailTemplate = t;
      var a = recipients.map(function(to) {
        return doSendTemplate(emailTemplate, data, sender, to);
      });
      return Promise.all(a);
    });
};

var populateAndSend = function(subject, content, data, from) {
  var sender, recipients;

  // data is an array of template data, which includes the userId of the recipient.

  var to = data.map(function(r) {
    return r.toUserId;
  });

  return fetchUsers(from)
    .then(function(f) {
      sender = f[0];
      return fetchUsers(to);
    })
    .then(function(r) {
      recipients = r;
      var a = recipients.map(function(to) {
        // get the data row that matches the recipient
        var d = _.find(data, function(r) { return r.toUserId.toString() === to._id.toString(); });
        return doPopulateAndSend(subject, content, d, sender, to);
      });

      return Promise.all(a);
    });

};

//
// var email = require(path.resolve('./modules/core/server/controllers/email.server.controller'));
//
// email.sendEmail("This is the subject.", "This is the content.  It will not be altered or added to.", req.user, 'some.user@localhost.com');
//
// email.sendTemplate('templateCodeName', {hello: "hello", world: "world"}, req.user, 'some.user@localhost.com');
//
// Allow callers to send email to other ESM Contacts/Users
// Emails will be sent individually with single recipients.
//
// sendEmail will send a static subject line and static content to the recipient list.
//   subject: string for subject line
//   body: string for email body/content, could be html, could be plain text.
//   from: generally the logged in user.  Accepts an id, a user object, email address, or username for an existing ESM User.
//   to: Accepts either a single value or array of id, a user object, email address, or username for an existing ESM User.  When an array, use the same identifier (username, _id, email).
//
// sendTemplate will get it's subject and content from the emailtemplate record/document.  These templates can have substitution values in both the subject and content {{replaceme}}.
//   template: Accepts an id, a emailtemplate object, or code for an existing Email Template.
//   data: either a JSON string (that can be parsed into an object) or an JSON object used to do replacements in the template.  
//   from: generally the logged in user.  Accepts an id, a user object, email address, or username for an existing ESM User.
//   to: Accepts either a single value or array of id, a user object, email address, or username for an existing ESM User.  When an array, use the same identifier (username, _id, email).
// 
// Values that will be added to data (and can be used in the template content or subject) are:
//   * fromEmail
//   * fromDisplayName
//   * toEmail
//   * toDisplayName
//
//
//
module.exports = {
  sendEmail    : sendEmail,
  sendTemplate : sendTemplate,
  populateAndSend: populateAndSend
};
